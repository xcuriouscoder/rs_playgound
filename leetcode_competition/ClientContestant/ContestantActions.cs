using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ClientContestant
{
    internal class ContestantActions
    {
        private int SecondsToWaitBeforeRetryingSubmission = 3; // N seconds to wait before retrying a submission after an incorrect result is received.
        private int SecondsToWaitBeforeCheckingResult = 1; // N seconds to wait before checking the result of a submission again when the status is pending.
        private HttpClient client;
        private string Username { get; set; }
        public string Email { get; }

        public Guid UserId { get; private set; }

        int ContestantNumber = 0;
        Random rand;

        private ContestantActions(HttpClient client)
        {
            if (client == null)
            {
                throw new ArgumentNullException(nameof(client), "HttpClient cannot be null.");
            }

            this.client = client;

            this.Username = "HopefulContestant_" + Guid.NewGuid();
            this.Email = this.Username + "@example.com";
        }

        internal async static Task<ContestantActions> CreateAsync(HttpClient client, int contestantNumber, Random rand)
        {
            if (client == null)
            {
                throw new ArgumentNullException(nameof(client), "HttpClient cannot be null.");
            }

            var contestantActions = new ContestantActions(client);

            contestantActions.ContestantNumber = contestantNumber;
            contestantActions.rand = rand ?? throw new ArgumentNullException(nameof(rand), "Random cannot be null.");

            await contestantActions.RegisterContestantAsync();

            return contestantActions;
        }

        private async Task RegisterContestantAsync()
        {
            var body = JsonSerializer.Serialize(new
            {
                username = this.Username,
                email = this.Email
            });

            var content = new StringContent(
                body,
                Encoding.UTF8,
                "application/json");
            
            var result = await this.client.PostAsync("/users", content);
            result.EnsureSuccessStatusCode();
            var data = await result.Content.ReadAsStringAsync();
            var jobj = JsonNode.Parse(data) as JsonObject;
            var userIdStr = jobj["id"]?.GetValue<string>();
            if(Guid.TryParse(userIdStr, out Guid userId))
            {
                this.UserId = userId;
            }
            else
            {
                throw new InvalidOperationException("Failed to parse UserId from response.");
            }
        }

        internal async Task<List<Guid>> GetProblemsAsync()
        {
            var result = await this.client.GetAsync("/competitions/d1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90/problems");
            result.EnsureSuccessStatusCode();
            var data = await result.Content.ReadAsStringAsync();
            var jobj = JsonNode.Parse(data) as JsonArray;
            var problemIds = new List<Guid>();
            foreach (var item in jobj)
            {
                var problemIdStr = item["id"]?.GetValue<string>();
                if (Guid.TryParse(problemIdStr, out Guid problemId))
                {
                    problemIds.Add(problemId);
                }
                else
                {
                    throw new InvalidOperationException("Failed to parse ProblemId from response.");
                }
            }
            return problemIds;
        }

        internal async Task SubmitCodeForProblemAsync(Guid problemId, string code)
        {
            /**
                * POST http://localhost:3004/competitions/d1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90/problems/b4b852cf-8781-4ab2-a00f-5fb52c39c478/submit
content-type: application/json
userid: f626a46e-a037-4950-b3c0-502382968a28

{
                "language": "python",
                "base64code": "cHJpbnQoIkhlbGxvLCBXb3JsZCEiKQ=="
} 
                        */

            var body = new Dictionary<string, object>
            {
                { "base64code",  "cHJpbnQoIkhlbGxvLCBXb3JsZCEiKQ=="},
                { "language", "python" }
            };

            var result = await this.client.ContentWithHeadersAndBodyAsync(
                body, 
                "/competitions/d1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90/problems/" + problemId.ToString() + "/submit",
                new Dictionary<string, string> { { "userid", this.UserId.ToString() } }, 
                HttpMethod.Post);

            result.EnsureSuccessStatusCode();
        }

        internal async Task<int> GetResultForCompetitionProblemAsync(Guid problemId)
        {
            var result = await this.client.ContentWithHeadersAsync(
                null,
                "/competitions/d1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90/problems/" + problemId.ToString() + "/result",
                new Dictionary<string, string> { { "userid", this.UserId.ToString() } },
                HttpMethod.Get);

            result.EnsureSuccessStatusCode();
            var content = await result.Content.ReadAsStringAsync();
            var jobj = JsonNode.Parse(content) as JsonObject;
            return int.Parse(jobj["status"].ToString());
        }

        internal async Task<List<LeaderScoreItem>> GetAllResultsForCompetitionAsync()
        {
            // GET http://localhost:3004/competitions/d1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90/leaderboard

            var result = await this.client.ContentWithHeadersAsync(
                null,
                "/competitions/d1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90/leaderboard",
                null,
                HttpMethod.Get);
            result.EnsureSuccessStatusCode();
            var content = await result.Content.ReadAsStringAsync();
            var leaders = JsonSerializer.Deserialize<List<LeaderScoreItem>>(content);
            return leaders;
        }

        internal async Task DoContestAsync()
        {
            var problems = await GetProblemsAsync();
            List<LeaderScoreItem> leaders;
            int currentScore = 0;
            int totalProblems = problems.Count;
            foreach (var problemId in problems)
            {
                currentScore++;
                Console.WriteLine($"**** C{this.ContestantNumber} currently working on problem {currentScore}/{totalProblems}");
                int status;
                do
                {
                    status = 0; // 0 = pending, 1 = correct, 2 = incorrect
                    Console.WriteLine($"C{this.ContestantNumber}: Submitting code for problem {problemId}...");
                    await SubmitCodeForProblemAsync(problemId, "print('Hello, World!')");

                    while (status == 0)
                    {
                        Console.WriteLine($"C{this.ContestantNumber}: Getting result for problem {problemId}...");
                        status = await GetResultForCompetitionProblemAsync(problemId);
                        Console.WriteLine($"C{this.ContestantNumber}: Current status for problem {problemId}: {status}");
                        if (status == 0)
                        {
                            Console.WriteLine("Result is still pending. Waiting for N seconds before checking again...");
                            await Task.Delay(this.SecondsToWaitBeforeCheckingResult * rand.Next(900, 1000));
                        }
                    }

                    if (status == 1)
                    {
                        Console.WriteLine($"C{this.ContestantNumber}: Submission for problem {problemId} is correct!");
                    }
                    else if (status == 2)
                    {
                        Console.WriteLine($"Submission for problem {problemId} is incorrect. Retrying...");
                        await Task.Delay((this.SecondsToWaitBeforeRetryingSubmission + rand.Next(10)) * rand.Next(800, 1000)); // Wait for N seconds before retrying to simulate fixing the code and resubmitting. 
                    }
                } while (status != 1);

                Console.WriteLine($"C{this.ContestantNumber}: Done with a problem, checking leaderboard.");

                await GetAndWriteLeadersToConsole();
            }

            Console.WriteLine($"C{this.ContestantNumber}: Done with all problems, spamming leaderboard.");

            for(int i = 0; i< 1000; i++)
            {
                Console.WriteLine($"C{this.ContestantNumber}: Getting leaderboard every 10s as spamming");
                await GetAndWriteLeadersToConsole();
                await Task.Delay(10000); // Small delay to avoid overwhelming the server.
            }
        }

        private async Task<List<LeaderScoreItem>> GetAndWriteLeadersToConsole()
        {
            var leaders = await GetAllResultsForCompetitionAsync();
            var top10 = leaders.OrderByDescending(l => l.score).Take(10).ToList();
            var top10Str = string.Join("\r\n", top10.Select(l => $"{l.value} ({l.score})"));
            Console.WriteLine($"C{this.ContestantNumber}: Top 10 leaderboard: \r\n{top10Str}");
            return leaders;
        }
    }
}
