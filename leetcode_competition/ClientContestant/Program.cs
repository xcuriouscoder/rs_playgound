namespace ClientContestant
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri("http://localhost:3004");

            Console.WriteLine("Hello, World!");
            var ca = await ContestantActions.CreateAsync(client);
            var data = await ca.GetProblemsAsync();
            await ca.SubmitCodeForProblemAsync(data[0], "print('Hello, World!')");
            var res = await ca.GetResultForCompetitionProblemAsync(data[0]);
        }
    }
}
