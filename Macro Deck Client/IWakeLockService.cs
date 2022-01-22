using SuchByte.MacroDeck.Settings;
using System;
using System.Collections.Generic;
using System.Text;

namespace SuchByte.MacroDeck
{
    public interface IWakeLockService
    {
        string WakeLockMethod { get; set; }
        void SetWakeLock(bool state);
    }
}
