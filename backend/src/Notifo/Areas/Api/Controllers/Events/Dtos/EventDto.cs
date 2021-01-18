﻿// ==========================================================================
//  Notifo.io
// ==========================================================================
//  Copyright (c) Sebastian Stehle
//  All rights reserved. Licensed under the MIT license.
// ==========================================================================

using System.Collections.Generic;
using System.Linq;
using NodaTime;
using Notifo.Domain.Apps;
using Notifo.Domain.Events;
using Notifo.Infrastructure.Reflection;

namespace Notifo.Areas.Api.Controllers.Events.Dtos
{
    public sealed class EventDto
    {
        private static readonly Dictionary<string, long> EmptyCounters = new Dictionary<string, long>();
        private static readonly Dictionary<string, string> EmptyProperties = new Dictionary<string, string>();

        /// <summary>
        /// The id of the event.
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// The topic path.
        /// </summary>
        public string Topic { get; set; }

        /// <summary>
        /// A custom id to identity the creator.
        /// </summary>
        public string? CreatorId { get; set; }

        /// <summary>
        /// The display name.
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// Additional user defined data.
        /// </summary>
        public string? Data { get; set; }

        /// <summary>
        /// The time when the event has been created.
        /// </summary>
        public Instant Created { get; set; }

        /// <summary>
        /// The final formatting infos.
        /// </summary>
        public NotificationFormattingDto Formatting { get; set; }

        /// <summary>
        /// Notification settings per channel.
        /// </summary>
        public Dictionary<string, NotificationSettingDto> Settings { get; set; }

        /// <summary>
        /// User defined properties.
        /// </summary>
        public Dictionary<string, string> Properties { get; set; }

        /// <summary>
        /// The scheduling options.
        /// </summary>
        public SchedulingDto? Scheduling { get; set; }

        /// <summary>
        /// The statistics counters.
        /// </summary>
        public Dictionary<string, long>? Counters { get; set; }

        /// <summary>
        /// True when silent.
        /// </summary>
        public bool Silent { get; set; }

        public static EventDto FromDomainObject(Event @event, App app)
        {
            var result = SimpleMapper.Map(@event, new EventDto());

            if (@event.Formatting.Subject.TryGetValue(app.Language, out var subject))
            {
                result.DisplayName = subject;
            }
            else
            {
                result.DisplayName = @event.Formatting.Subject.Values.FirstOrDefault() ?? string.Empty;
            }

            result.Properties = @event.Properties ?? EmptyProperties;

            result.Settings ??= new Dictionary<string, NotificationSettingDto>();

            if (@event.Settings != null)
            {
                foreach (var (key, value) in @event.Settings)
                {
                    if (value != null)
                    {
                        result.Settings[key] = NotificationSettingDto.FromDomainObject(value);
                    }
                }
            }

            result.Counters = @event.Counters ?? EmptyCounters;

            return result;
        }
    }
}
