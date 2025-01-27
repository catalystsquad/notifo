﻿// ==========================================================================
//  Notifo.io
// ==========================================================================
//  Copyright (c) Sebastian Stehle
//  All rights reserved. Licensed under the MIT license.
// ==========================================================================

using Notifo.Infrastructure;

#pragma warning disable SA1313 // Parameter names should begin with lower-case letter

namespace Notifo.Domain
{
    public record struct TrackingToken(Guid Id, string? Channel = null, string? DeviceIdentifier = null)
    {
        public readonly bool IsValid => Id != default;

        public static TrackingToken Parse(string id, string? channel = null, string? deviceIdentifier = null)
        {
            TryParse(id, channel, deviceIdentifier, out var result);

            return result;
        }

        public static bool TryParse(string id, string? channel, string? deviceIdentifier, out TrackingToken result)
        {
            result = default;

            if (string.IsNullOrWhiteSpace(id))
            {
                return false;
            }

            if (Guid.TryParse(id, out var guid))
            {
                result = new TrackingToken(guid, channel, deviceIdentifier);
                return true;
            }

            try
            {
                var decoded = id.FromBase64().Split('|');

                if (!Guid.TryParse(decoded[0], out guid))
                {
                    return false;
                }

                if (decoded.Length >= 1 && !string.IsNullOrWhiteSpace(decoded[1]))
                {
                    channel = decoded[1];
                }

                if (decoded.Length >= 2 && !string.IsNullOrWhiteSpace(decoded[2]))
                {
                    deviceIdentifier = string.Join('|', decoded.Skip(2));
                }

                if (string.IsNullOrWhiteSpace(channel))
                {
                    channel = null;
                }

                if (string.IsNullOrWhiteSpace(deviceIdentifier))
                {
                    deviceIdentifier = null;
                }

                result = new TrackingToken(guid, channel, deviceIdentifier);
                return true;
            }
            catch (FormatException)
            {
                return false;
            }
        }

        public readonly string ToParsableString()
        {
            var compound = $"{Id}|{Channel}|{DeviceIdentifier}";

            return compound.ToBase64();
        }
    }
}
