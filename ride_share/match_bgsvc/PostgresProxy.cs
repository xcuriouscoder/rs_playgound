using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Npgsql;
using NpgsqlTypes;

namespace match_bgsvc
{
    internal class PostgresProxy
    {
        private string pgConnectionString;

        private string PGConnectionString
        {
            get
            {
                if (string.IsNullOrEmpty(pgConnectionString))
                {
                    pgConnectionString =
                        $"Server=db;Port=5432;User Id=postgres;Password={Environment.GetEnvironmentVariable("POSTGRES_PASSWORD")};Database={Environment.GetEnvironmentVariable("POSTGRES_DB")};";
                }

                return pgConnectionString;
            }
        }

        public async Task<Ride> GetRideAsync(Guid rideId)
        {
            using (var con = new Npgsql.NpgsqlConnection(this.PGConnectionString))
            {
                using (var cmd = new NpgsqlCommand())
                {
                    cmd.Connection = con;
                    cmd.CommandText = "SELECT id, sourcelocation, destination FROM rides WHERE id = @rideId AND rideStatus = 1 AND driverid is null";
                    cmd.Parameters.AddWithValue("rideId", rideId);

                    con.Open();
                    var res = await cmd.ExecuteReaderAsync();


                    if (await res.ReadAsync())
                    {
                        var retVal = new Ride
                        {
                            RideId = res.GetGuid(0)
                        };

                        var sourceLocation = res.GetValue(1);
                        if (sourceLocation is NpgsqlPoint sourcePoint)
                        {
                            retVal.SourceLatitude = sourcePoint.X;
                            retVal.SourceLongitude = sourcePoint.Y;
                        }

                        var destinationLocation = res.GetValue(2);
                        if (destinationLocation is NpgsqlPoint destPoint)
                        {
                            retVal.DestinationLatitude = destPoint.X;
                            retVal.DestinationLongitude = destPoint.Y;
                        }

                        var loggit = JsonSerializer.Serialize(retVal);
                        Console.WriteLine($"Ride fetched: {loggit}");

                        return retVal;
                    }
                    else
                    {
                        return null;
                    }
                }
            }

        }

        public async Task AssignDriverToRideAsync(Guid rideId, Guid driverId)
        {
            using (var con = new Npgsql.NpgsqlConnection(this.PGConnectionString))
            {
                using (var cmd = new NpgsqlCommand())
                {
                    cmd.Connection = con;
                    cmd.CommandText = "UPDATE rides SET driverid = @driverId, rideStatus = 2 WHERE id = @rideId";
                    cmd.Parameters.AddWithValue("rideId", rideId);
                    cmd.Parameters.AddWithValue("driverId", driverId);
                    con.Open();
                    var rowsAffected = await cmd.ExecuteNonQueryAsync();
                    Console.WriteLine($"Set driver {driverId} for ride {rideId}, rows affected: {rowsAffected}");
                }
            }
        }
    }
}
