﻿// ==========================================================================
//  Notifo.io
// ==========================================================================
//  Copyright (c) Sebastian Stehle
//  All rights reserved. Licensed under the MIT license.
// ==========================================================================

using Squidex.Log;

namespace Notifo.Pipeline
{
    public sealed class LogConfigurationHost : IHostedService
    {
        private readonly IConfiguration configuration;
        private readonly ISemanticLog log;

        public LogConfigurationHost(IConfiguration configuration, ISemanticLog log)
        {
            this.configuration = configuration;

            this.log = log;
        }

        public Task StartAsync(
            CancellationToken cancellationToken)
        {
            log.LogInformation(w => w
                .WriteProperty("message", "Application started")
                .WriteObject("environment", c =>
                {
                    var logged = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                    var orderedConfigs = configuration.AsEnumerable().Where(kvp => kvp.Value != null).OrderBy(x => x.Key, StringComparer.OrdinalIgnoreCase);

                    foreach (var (key, val) in orderedConfigs)
                    {
                        if (logged.Add(key))
                        {
                            c.WriteProperty(key.ToLowerInvariant(), val);
                        }
                    }
                }));

            return Task.CompletedTask;
        }

        public Task StopAsync(
            CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
