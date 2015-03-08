+++
date = "2015-03-08T23:06:00+13:00"
draft = false
title = "Error Handling in ASP.NET MVC"

+++

So today we're gonna talk about how to make sure you don't show your users something like this: 

<img src="/img/posts/error-handling-in-asp-net-mvc/ysod.png" alt="The yellow screen of death" />

And then making sure that you know that they would have been shown that, and hopefully give you some more infomation to boot. Originally this post was going to be a bit of a monster, but I've chosen to chop up the hydra a little bit..

This post just covers how to deal with making IIS catch all the errors that might not get caught inside of your MVC application. I'll dig into the levels closer to MVC in the next post, and then handling error logging in another one after that. They're both already semi-written, so they should follow along soonish. If you aren't really too worried about the reasoning, and trust me enough to just want to get to the money, I'll have a quick summary "just do this" post up after the long version is finished.

So. Let's cover the territory of possible ways to show custom error pages to your users, because this being something from Microsoft, there's at least six ways to do a thing, and none of them are exactly what you want. Well, ok. There's only like 4 that I know of:

You can use an exception handling filter, like the HandleErrorAttribute that's included by default, or you can use a module (basically the same idea as a filter, but further up the chain.), the most promienent example of which would probably be ELMAH. Further torwards the edges of MVC, you can turn to the customErrors thing in your web.config, which as far as I can tell is implemented with a module as well, or finally you can look to the httpErrors option, which lives inside of IIS rather than MVC, but is also in your web.config.

Basically I'm of the opinion you should always pick #4, the IIS option, since it's the highest level of coverage. Anything that goes wrong with all of the other options will end up with whatever is in the `httpErrors` tag getting shown. 

You can mix and match any of the other ones along with that to suit your preference, I usually also use the customErrors option, since this is the point most outside of the MVC pipeline but still inside it you can catch exceptions, so it gives you the least exposure to potential issues with your MVC site. At least that's my reasoning, you may come up with a different calculus.

The reason I don't use filters is because an error inside of your filter config or somewhere inside your global.asax or whatever will cause them to fail completely. The config option does leave you open to issues in your web.config, but if that's hosed you have to rely on your base IIS config. Which hopefully won't show anything ugly to your users. You should probably check that. 

The other issue with filters is they won't fire for what I call the "deathmurder exceptions" - stuff like stack overflows and out of memory exceptions that just totally kill your application. The stuff you define under that httpErrors tag is, once again, what will save your ass.

So let's cover that first. 

So in order to deal with this, you have to add another section to your web.config, under the `system.webserver` tag:

	<httpErrors errorMode="Custom">
	  <remove statusCode="404"/>
	  <error statusCode="404" path="/Views/Errors/404.html" responseMode="File" />
	  <remove statusCode="500"/>
	  <error statusCode="500" path="/Views/Errors/500.html" responseMode="File" />
	</httpErrors>

So what's going on here is we're telling IIS to use pretty error pages using the `errorMode="Custom"` attribute. You can set that to `DetailedLocalOnly` for general use, but while we're messing with this stuff, we want to make sure you'll actually see the custom error pages, so leave it as `Custom` for the moment.

The rest of it is basically removing the default IIS error pages (otherwise it'll spew at you when you start up the app) and replacing them with our own static HTML files. You can use .aspx files here, but if you get to this point, something has probably gone terribly wrong inside your app, so I would try and avoid relying on any code actually doing anything.

There are a couple of additonal attributes you might be considering adding, like `defaultPath` and `defaultResponseMode` however defaultPath seems to cause IIS express to throw it's own exception when running on my machine which would seem to make `defaultResponseMode` somewhat pointless. But if you manage to get it working, please let me know [@lfln3](https://twitter.com/lfln3).

There is another option if you want to use some custom code, where you can change the `responseMode` to `ExecuteUrl` and then point the path to an .aspx file. This does mean it will rewrite the response code to a 200, however, which is probably not what you want. To cover that, you can add this snippet to the top of your .aspx file.

	<%@ Page Language="C#" %>
	<% Response.StatusCode = 404; %>

Ideally there'd be some way of jacking the error status code when getting directed from the custom error definition, but I haven't figured out a way of doing that yet, or if it's even possible. If anyone's got any ideas, once again hit me up at [@lfln3](https://twitter.com/lfln3).

I'd not hugely comfortable personally with having code exectue in my error handlers, but if you're ok with it, go nuts. In any case, this should basically iron-clad your app against the possiblity of showing any ugly yellow pages to your users. 

I have created a nuget package to speed this thing up a little, which you can find [here](https://www.nuget.org/packages/MVCErrorPages/), or just run `Install-Package MVCErrorPages`. It does include the MVC customErrors stuff, which I'm gonna cover in a later installment. But in the mean time, google should be able to help you out. In the meantime... good luck, I guess?