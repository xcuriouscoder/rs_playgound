using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Confluent.Kafka;

namespace match_bgsvc
{
    internal class KafkaProxy
    {
        private IConsumer<Ignore, string> consumer;

        internal KafkaProxy()
        {
            Console.WriteLine("Creating Kafka consumer...");
            var config = new ConsumerConfig
            {
                BootstrapServers = "kafka:9092", // Replace with your broker address
                GroupId = "your-consumer-group", // Unique group ID for your consumer
                AutoOffsetReset = AutoOffsetReset.Earliest // Start reading from the earliest message
            };

            this.consumer = new ConsumerBuilder<Ignore, string>(config).Build();

            Console.WriteLine("Kafka consumer created.");
            this.consumer.Subscribe("riderequested"); // Replace with your topic name
            Console.WriteLine("Subscribed to Kafka topic 'riderequested'.");
        }

        internal string ProcessMessages(Func<Guid, Task> processRideAsync)
        {
            Console.WriteLine($"Waiting to process Kafa messages.");
            while (true)
            {
                var message = consumer.Consume();
                Console.WriteLine($"Received message: {message.Message.Value}");
                var retVal = message.Message.Value;

                if(Guid.TryParse(message.Message.Value, out Guid rideId))
                {
                    Console.WriteLine($"Message received {(message.Message.Value != null ? message.Message.Value : "No Value")}");
                    // fire and forget
                    Task.Run(() => processRideAsync(rideId)).Wait();
                    consumer.Commit(message);
                }
                else
                {
                    Console.WriteLine($"Invalid Ride ID received [{message.Message.Value}].");
                }
            }
        }
    }
}
