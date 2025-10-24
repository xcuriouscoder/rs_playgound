using Npgsql;
using StackExchange.Redis;

namespace match_bgsvc
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;

        private Random rand = new Random();
        private RedisProxy redisProxy = new RedisProxy();

        public Worker(ILogger<Worker> logger)
        {
            _logger = logger;

            redisProxy.RegisterSubscriptionForRideAsync(ProcessRideAsync).Wait();


            //var muxer = ConnectionMultiplexer.Connect("redis");
            //var sub = muxer.GetSubscriber();
            //sub.SubscribeAsync("riderequested", async (channel, message) =>
            //{
            //    Console.WriteLine($"Message received {(message.HasValue ? message : "No Value")}");

            //    if (Guid.TryParse(message, out Guid rideId))
            //    {
            //        Console.WriteLine($"Message received {(message.HasValue ? message : "No Value")}");
            //        // fire and forget
            //        await ProcessRideAsync(rideId);
            //    }
            //    else
            //    {
            //        Console.WriteLine($"Invalid Ride ID received [{message}].");
            //    }

            //}).Wait();

            //Console.WriteLine("Connected to Redis");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                // put cc here to check for activated rides not yet picked up.
                if (_logger.IsEnabled(LogLevel.Information))
                {
                    _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                }
                await Task.Delay(600000, stoppingToken);
            }
        }

        public async Task ProcessRideAsync(Guid rideId)
        {
            var pgProxy = new PostgresProxy();

            var ride = await pgProxy.GetRideAsync(rideId);
            if (ride != null)
            {
                Console.WriteLine($"Processing ride request {ride.RideId} from ({ride.SourceLatitude}, {ride.SourceLongitude}) to ({ride.DestinationLatitude}, {ride.DestinationLongitude})");
                // Simulate driver assignment

                GeoRadiusResult[] nearbyDrivers;
                var milesRadius = 5.0; // miles

                do
                {
                    nearbyDrivers = await redisProxy.GetClosestDriversForLatAndLong(ride.SourceLatitude, ride.SourceLongitude, milesRadius);
                    foreach (var driver in nearbyDrivers)
                    {
                        Console.WriteLine($"Found nearby driver at {driver.Member} located at ({driver.Position?.Latitude}, {driver.Position?.Longitude})");

                        // lock
                        if (await redisProxy.IsDriverAvailable(driver.Member.ToString()))
                        {
                            var callback = redisProxy.GetDriverCallbackAsync(driver.Member.ToString());
                            if (callback != null)
                            {
                                if (await DriverAcceptsRideAsync(callback, ride.RideId))
                                {
                                    // update DB
                                    Console.WriteLine($"Driver {driver.Member} accepted ride {ride.RideId}");
                                    await pgProxy.AssignDriverToRideAsync(ride.RideId, Guid.Parse(driver.Member.ToString()));
                                    return;
                                }
                                else
                                {
                                    Console.WriteLine($"Driver {driver.Member} rejected ride {ride.RideId}, trying next.");
                                    continue;
                                }
                            }
                            else
                            {
                                await redisProxy.RemoveDriverFromGeospatialAsync(driver.Member.ToString());
                            }
                        }
                        else
                        {
                            Console.WriteLine($"Removing {driver.Member} from location tracking.");
                            await redisProxy.RemoveDriverFromGeospatialAsync(driver.Member.ToString());
                        }
                    }

                    Console.WriteLine($"No drivers accepted the ride, expanding search radius from {milesRadius}.");
                }
                while ((milesRadius += 5.0) < 100.0);
            }
            else
            {
                Console.WriteLine($"No available ride found for Ride ID {rideId}");
            }
        }

        private async Task<bool> DriverAcceptsRideAsync(Task<string> callback, Guid rideId)
        {
            return await Task.FromResult(rand.Next(0, 2) == 1);
        }
    }
}
