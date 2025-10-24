using DriverClient;

internal class Program
{
    private static async Task Main(string[] args)
    {
        Console.WriteLine("Hello, World!");
        //        var locClient = new LocationClient();

        var client = new HttpClient();

        // await SimulateDriversAsync(client);

        await LoadTestLocationServiceAsync(client);
    }

    private static async Task LoadTestLocationServiceAsync(HttpClient client)
    {
        var driverCount = 40000;
        var drivers = new List<LocationClient>(driverCount + 1);

        Console.WriteLine($"Creating {driverCount} drivers.");

        for (int i = 0; i < driverCount; i++)
        {
            var locClient = new LocationClient(Guid.NewGuid(), client);
            drivers.Add(locClient);
        }

        Console.WriteLine("Starting location updates.");

        var startTime = DateTime.UtcNow;

        foreach (var driver in drivers)
        {
            driver.StartLocationCalls();
            await Task.Delay(1);
        }

        Console.WriteLine("Drivers started.  Waiting...");

        await Task.Delay(60000);

        foreach (var driver in drivers)
        {
            driver.StopLocationCalls();
        }

        Console.WriteLine("Drivers Stopped.");
        
        var endTime = DateTime.UtcNow;

        foreach (var driver in drivers)
        {
            Console.WriteLine($"Driver {driver.DriverId} sent {driver.Count}");
        }

        var totalCount = drivers.Sum(d => d.Count);
        var totalSeconds = (endTime - startTime).TotalSeconds;
        var rate = totalCount / (double)totalSeconds;
        Console.WriteLine($"Total location updates sent: {totalCount}");
        Console.WriteLine($"Effective rate (loc/sec): {rate}");
    }

    private static async Task SimulateDriversAsync(HttpClient client)
    {
        var driverGuids = new Guid[]
        {
            Guid.Parse("6d9815f8-c8c0-48e4-9bf7-9461f0e2bc25"),
            //Guid.Parse("3a7e1a87-1c1b-475f-ab11-ab5d32dd123e"),
            //Guid.Parse("66411b4b-64f2-4e22-9009-8183ea6ee8e9")
        };

        var drivers = new List<LocationClient>();
        Console.WriteLine($"Creating {driverGuids.Length} drivers.");
        foreach (var driverGuid in driverGuids)
        {
            var locClient = new LocationClient(driverGuid, client);
            locClient.RegisterDriverAsync().Wait();
            locClient.StartLocationCalls();
            drivers.Add(locClient);

            await Task.Delay(10);
        }

        while (true)
        {
            Console.WriteLine("Current location update counts:");
            foreach (var driver in drivers)
            {
                Console.WriteLine($"Driver {driver.DriverId} sent {driver.Count}");
            }
            await Task.Delay(10000);
        }
    }
}