namespace ClientContestant
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri("http://localhost:3004");
            var rand = new Random();
            var ca = await ContestantActions.CreateAsync(client, 1, rand);

            var playerCount = 10000;

            Console.WriteLine($"Creating {playerCount} contestants...");
            var players = new List<ContestantActions>(playerCount);
            for(int i = 0; i < playerCount; i++)
            {
                var contestant = await ContestantActions.CreateAsync(client, i, rand);
                players.Add(contestant);
            }

            Console.WriteLine($"Starting {playerCount} contestants...");
            var runTasks = new List<Task>(playerCount);
            foreach(var contestant in players)
            {
                runTasks.Add(Task.Run(async () => await contestant.DoContestAsync()));
            }

            await Task.WhenAll(runTasks);

            //await Parallel.ForEachAsync(players, new CancellationToken(), async (contestant, cancellationToken) =>
            //{
            //    await Task.Run(async () => await contestant.DoContestAsync());
            //});

//            await ca.DoContestAsync();

            //Console.WriteLine("Hello, World!");
            //var data = await ca.GetProblemsAsync();
            //await ca.SubmitCodeForProblemAsync(data[0], "print('Hello, World!')");
            //var res = await ca.GetResultForCompetitionProblemAsync(data[0]);
            //var leaders = await ca.GetAllResultsForCompetitionAsync();
        }
    }
}
