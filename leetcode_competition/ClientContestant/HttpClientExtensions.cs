using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ClientContestant
{
    public static class HttpClientExtensions
    {
        public static async Task<HttpResponseMessage> ContentWithHeadersAsync(
            this HttpClient httpClient,
            HttpContent content,
            string requestUri,
            Dictionary<string, string> headers,
            HttpMethod method)
        {
            using (var request = new HttpRequestMessage(method, requestUri))
            {
                if(content != null)
                {
                    request.Content = content;
                }

                foreach (var header in headers)
                {
                    request.Headers.Add(header.Key, header.Value);
                }

                return await httpClient.SendAsync(request);
            }
        }

        public static async Task<HttpResponseMessage> ContentWithHeadersAndBodyAsync(
            this HttpClient httpClient,
            Dictionary<string, object> body,
            string requestUri,
            Dictionary<string, string> headers,
            HttpMethod method)
        {
            var content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json");

            return await ContentWithHeadersAsync(httpClient, content, requestUri, headers, method);
        }
    }
}