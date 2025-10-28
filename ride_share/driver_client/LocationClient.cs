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
        HttpClient client;
        Random random = new Random();
        Timer timer;

        public string DriverId { get; private set; }

        public int Count { get; private set; } = 0;

        public LocationClient(Guid driverId, HttpClient client)
        {
            this.DriverId = driverId.ToString();
            this.client = client;
            //client.DefaultRequestHeaders.Accept.Clear();
            //client.DefaultRequestHeaders.Add("userid", DriverId);
            //client.BaseAddress = new Uri("http://localhost:3002");

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
            timer.Change(TimeSpan.FromMilliseconds(10), TimeSpan.FromSeconds(5));
        }

        internal void StopLocationCalls()
        {
            timer.Change(Timeout.Infinite, Timeout.Infinite);
        }

        internal async Task ProcessRepositoriesAsync()
        {

            var data = JObject.FromObject(new
            {
                latitude = 47.1 + random.NextDouble(),
                longitude = -122.5 + random.NextDouble()
            });

            var response = await client.ContentWithHeadersAsync(
                new StringContent(JsonConvert.SerializeObject(data),
                        Encoding.UTF8,
                        "application/json"),
                "/locations",
                new Dictionary<string, string> { { "userid", this.DriverId } },
                HttpMethod.Post);

            //var response = await client.PostAsync("/locations",
            //        new StringContent(JsonConvert.SerializeObject(data),
            //            Encoding.UTF8, 
            //            "application/json"));

            response.EnsureSuccessStatusCode();

            this.Count++;

            var responseContent = await response.Content.ReadAsStringAsync();
        }

        internal async Task RegisterDriverAsync()
        {
            using (var rideClient = new HttpClient())
            {
                rideClient.DefaultRequestHeaders.Accept.Clear();
                rideClient.DefaultRequestHeaders.Add("driverid", this.DriverId);
                rideClient.BaseAddress = new Uri("http://localhost:3003");

                var data = JObject.FromObject(new
                {
                    callbackurl = "http://localhost/fake/url" + random.NextInt64()
                });

                var response = await rideClient.PostAsync("/v1/registerdrivers",
                        new StringContent(JsonConvert.SerializeObject(data),
                        Encoding.UTF8,
                        "application/json"));
            }
        }
    }
}
