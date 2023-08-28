using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace SuchByte.MacroDeck
{
    public class DeviceFoundEventArgs : EventArgs
    {
        public string ComputerName { get; set; }
        public string Host { get; set; }
    }

    public static class BroadcastReceiver
    {
        public static event EventHandler<DeviceFoundEventArgs> DeviceFound;

        static bool running = false;
        static UdpClient udpClient;


        public static void Start()
        {
            if (running) return;
            running = true;
            Task.Run(async () =>
            {
                using (udpClient = new UdpClient(8191))
                {
                    while (true)
                    {
                        try
                        {
                            var receivedResults = await udpClient.ReceiveAsync();
                            JObject receivedObject = JObject.Parse(Encoding.ASCII.GetString(receivedResults.Buffer));
                            var computerName = receivedObject["computer-name"].ToString();
                            var ipAddress = receivedObject["ip-address"].ToString();
                            var port = receivedObject["port"].ToString();
                            if (DeviceFound != null)
                            {
                                DeviceFound(computerName, new DeviceFoundEventArgs { ComputerName = computerName, Host = ipAddress + ":" + port });
                            }
                        } catch { }
                    }
                }
            });
        }

        public static void Stop()
        {
            running = false;
            udpClient.Dispose();
        }



    }
}
