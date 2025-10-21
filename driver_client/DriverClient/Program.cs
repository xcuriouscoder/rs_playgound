using DriverClient;

internal class Program
{
    private static async Task Main(string[] args)
    {
        Console.WriteLine("Hello, World!");
        var locClient = new LocationClient();

        var driverCount = 1000;

        var drivers = new List<LocationClient>(driverCount+1);

        Console.WriteLine($"Creating {driverCount} drivers.");

        for (int i = 0; i < driverCount; i++)
        {
            var client = new LocationClient();
            drivers.Add(client);
        }

        Console.WriteLine("Starting location updates.");

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

        foreach(var driver in drivers)
        {
            Console.WriteLine($"Driver {driver.DriverId} sent {driver.Count}");
        }

        var totalCount = drivers.Sum(d => d.Count);
        Console.WriteLine($"Total location updates sent: {totalCount}");
    }
}