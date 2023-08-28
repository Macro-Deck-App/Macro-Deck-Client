using System;
using System.Collections.Generic;
using System.Text;

namespace SuchByte.MacroDeck
{
    public interface IAppVersionProvider
    {
        string AppVersion { get; }
    }
}
