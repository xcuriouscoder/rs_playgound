using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace DriverClient
{
    public class LocationClient
    {
        HttpClient client = new HttpClient();
        Random random = new Random();
        Timer timer;

        public string DriverId { get; } = Guid.NewGuid().ToString();

        public int Count { get; private set; } = 0;

        public LocationClient()
        {
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Add("userid", DriverId);
            client.BaseAddress = new Uri("http://localhost:3002");

            timer = new Timer(async _ => 
            {
                try
                {
                    await ProcessRepositoriesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing location for driver {DriverId} Count {Count}: {ex.Message}");
                }
            }, 
            null, 
            Timeout.Infinite, 
            Timeout.Infinite);
        }

        internal void StartLocationCalls()
        {
            Count = 0;
            timer.Change(TimeSpan.FromSeconds(0), TimeSpan.FromSeconds(5));
        }

        internal void StopLocationCalls()
        {
            timer.Change(Timeout.Infinite, Timeout.Infinite);
        }

        internal async Task ProcessRepositoriesAsync()
        {

            var data = JObject.FromObject(new
            {
                latitude = 47 + random.NextDouble(),
                longitude = -122 + random.NextDouble()
            });

            var response = await client.PostAsync("/locations",
                    new StringContent(JsonConvert.SerializeObject(data),
                    Encoding.UTF8, 
                    "application/json"));

            response.EnsureSuccessStatusCode();

            this.Count++;

            var responseContent = await response.Content.ReadAsStringAsync();
        }
    }
}
