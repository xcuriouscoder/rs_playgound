using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StackExchange.Redis;

namespace match_bgsvc
{
    internal class RedisProxy
    {
        public RedisProxy() { }

        public async Task RegisterSubscriptionForRideAsync(Func<Guid, Task> actionAsync)
        {
            var muxer = ConnectionMultiplexer.Connect("redis");
            var sub = muxer.GetSubscriber();

            await sub.SubscribeAsync("riderequested", async (channel, message) =>
            {
                if (Guid.TryParse(message, out Guid rideId))
                {
                    Console.WriteLine($"Message received {(message.HasValue ? message : "No Value")}");
                    await Task.Run(() => actionAsync(rideId));
                }
                else
                {
                    Console.WriteLine($"Invalid Ride ID received [{message}].");
                }

            });

            Console.WriteLine("Subscribed to channel");
        }

        public async Task<GeoRadiusResult[]> GetClosestDriversForLatAndLong(double latitude, double longitude, double radius)
        {
            var muxer = ConnectionMultiplexer.Connect("redis");
            var db = muxer.GetDatabase();

            Console.WriteLine($"Searching for drivers within {radius} miles of lat:{latitude}, long:{longitude}");

            // Example of adding a driver to a geospatial index
            var locs = await db.GeoSearchAsync(
                "seattle",
                longitude,
                latitude,
                new GeoSearchCircle(radius, GeoUnit.Miles),
                100,
                false,
                Order.Ascending);

            Console.WriteLine($"Found {locs.Length} drivers");

            return locs;
        }

        public async Task<bool> IsDriverAvailable(string driverId)
        {
            var muxer = ConnectionMultiplexer.Connect("redis");
            var db = muxer.GetDatabase();

            if(await db.StringSetAsync("lockeddriver" + driverId, "true", TimeSpan.FromSeconds(10), When.NotExists))
            {
                Console.WriteLine("Driver {driverId} locked for availability check.");
                return true;
            }
            else
            {
                Console.WriteLine("Driver {driverId} is already locked for availability check.");
                return false;
            }
        }

        internal async Task RemoveDriverFromGeospatialAsync(string driverId)
        {
            var muxer = ConnectionMultiplexer.Connect("redis");
            var db = muxer.GetDatabase();
            
            if (await db.GeoRemoveAsync("seattle", driverId))
            {
                Console.WriteLine($"Driver {driverId} removed from geospatial index.");
            }
            else
            {
                Console.WriteLine($"Driver {driverId} was not found in geospatial index.");
            }
        }

        internal async Task<string> GetDriverCallbackAsync(string driverId)
        {
            Console.WriteLine($"Retrieving callback for driver {driverId}");
            var muxer = ConnectionMultiplexer.Connect("redis");
            var db = muxer.GetDatabase();

            var callback = await db.StringGetAsync(driverId);

            return callback;
        }
    }
}
