using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DriverClient
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
                request.Content = content;
                foreach (var header in headers)
                {
                    request.Headers.Add(header.Key, header.Value);
                }

                return await httpClient.SendAsync(request);
            }
        }
    }
}
