using System;
using System.Collections.Generic;
using System.Linq;
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
        private HttpClient client;
        private string Username { get; set; }
        public string Email { get; }

        public Guid UserId { get; private set; }

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

        internal async static Task<ContestantActions> CreateAsync(HttpClient client)
        {
            if (client == null)
            {
                throw new ArgumentNullException(nameof(client), "HttpClient cannot be null.");
            }

            var contestantActions = new ContestantActions(client);
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
    }
}
