using System.Text.Json.Serialization;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace match_svc
{
    public class RedisProxy
    {
        public async Task GeoSearchAsync()
        {
            var muxer = ConnectionMultiplexer.Connect("redis:6379");
            var db = muxer.GetDatabase();

            var locs = await db.GeoSearchAsync(
                "seattle",
                -122.14860816940586,
                47.680824262371786, 
                new GeoSearchCircle(100, GeoUnit.Miles));
            // 47.680824262371786, -122.14860816940586

            var locString = JsonConvert.SerializeObject(locs);

            Console.WriteLine("Found Locs" + locString);
        }
    }
}
