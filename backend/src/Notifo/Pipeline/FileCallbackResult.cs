﻿// ==========================================================================
//  Notifo.io
// ==========================================================================
//  Copyright (c) Sebastian Stehle
//  All rights reserved. Licensed under the MIT license.
// ==========================================================================

using Microsoft.AspNetCore.Mvc;
using Notifo.Infrastructure;
using Squidex.Assets;

#pragma warning disable MA0048 // File name must match type name

namespace Notifo.Pipeline
{
    public delegate Task FileCallback(Stream body, BytesRange range,
            CancellationToken ct);

    public sealed class FileCallbackResult : FileResult
    {
        public bool ErrorAs404 { get; set; }

        public bool SendInline { get; set; }

        public long? FileSize { get; set; }

        public FileCallback Callback { get; }

        public FileCallbackResult(string contentType, FileCallback callback)
            : base(contentType)
        {
            Guard.NotNull(callback);

            Callback = callback;
        }

        public override Task ExecuteResultAsync(ActionContext context)
        {
            var executor = context.HttpContext.RequestServices.GetRequiredService<FileCallbackResultExecutor>();

            return executor.ExecuteAsync(context, this);
        }
    }
}
