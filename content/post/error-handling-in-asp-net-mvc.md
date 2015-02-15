+++
date = "2015-02-15T12:30:12+13:00"
draft = true
title = "Error Handling in ASP.NET MVC"

+++

So today we're gonna talk about how to make sure you don't show your users something like this: 

YSOD pic

While also making sure that you know that they would have been shown that, and hopefully give you some more infomation to boot. We'll tackle the hiding bit first.

Ok, so at the moment, you're probably using something like this in your web.config:

	<customErrors mode="RemoteOnly">
	    <error statusCode="404" path="~/Views/Errors/404.cshtml" />
	    <error statusCode="500" path="~/Views/Errors/500.cshtml" />
	</customErrors>

Which only covers some of the cases, and somewhat poorly to boot. There's two issues - first off, if you end up on one of these pages via an error, and take a look in your network panel, you'll see that they both are actually returning redirects, and 200's. I'm not sure exactly why this is the default behaviour, but thankfully we can fix it.

First off, to stop the redirects, you have to add this attribute to your customErrors tag:

	<customErrors mode="RemoteOnly" redirectMode="ResponseRewrite">
        <error statusCode="404" path="~/Views/Errors/404.cshtml" />
	    <error statusCode="500" path="~/Views/Errors/500.cshtml" />
	</customErrors>