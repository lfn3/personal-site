+++
date = "2013-03-12T18:32:40+12:00"
draft = false
title = "Fun with Icon Fonts"
aliases = ["/blog/posts/fun-with-icon-fonts.html", "blog/posts/fun-with-icon-fonts"]
+++

So I spent a good chunk of today messing around with making a few icons for use on this site. Which was... interesting. There isn't really a heck of a lot of information out there about how to do this, or at least nothing that google turned up. I managed to cobble something together though. And now hopefully reading this will save you all that effort.

<!--more-->

First of all, why would you want to do this anyway? Well personally, I like the fact that I stop serving as many images, save on bandwidth, and get all the css and html text attributes for free. Basically the only drawback as far as I can see is the extra work involved in producing vector art and the messing around with turning it into a font. The only other issue is that your icon *has* to be mono coloured. You can't have some multicoloured Bob Ross shit. If you want to do something like that, you'll have to use actual images.

Got some pretty picture in your head you want to make into reality? Read on.

There's two tools I ended up using: [Inkscape](http://inkscape.org/) and [FontForge](http://fontforge.org/), both of which are free and cross platform. Inkscape includes some basic tools that allow you to produce a SVG font, however that isn't amazingly useful in order to actually produce something the people looking at your site can see. I then used FontForge to edit the attributes, make sure I didn't completely mangle everything and export all the formats I wanted.

If you're new to vector imaging tools, InkScape is probably going to be kinda confusing. I might throw together a quick tutorial on it later, however until then, try taking a look [round here](http://inkscapetutorials.wordpress.com/), and [the official docs](http://inkscape.org/doc/).

Ok. So you've opened up Inkscape, and you're looking at a blank page. Probably the wrong page. Hit File -> New -> fontforge_glyph. ![New Glyph](/img/posts/fun-with-icon-fonts/new-fontforge-glyph.png) The devs of inkscape are ever so thoughtful, aren't they? This will give you the 1000px by 1000px canvas you need. That line blue about 3/4 of the way down the canvas is the baseline, or where most fonts put the bottom of their characters. ![Blank Canvas](/img/posts/fun-with-icon-fonts/blank-canvas.png) You'll want to treat that as the bottom of whatever you've chosen to make.

At this point you'll probably want to pull open the sidebar, since the *Fill and Stroke* pane is really, really useful If you head to Object -> Fill and Stroke, you should get something like this: -![Stroke and Fill Pane](/img/posts/fun-with-icon-fonts/stroke-and-fill-pane.png) Also while we're at it, the *SVG Font Editor Pane* will also see some heavy use. That can be found under Text -> SVG Font Editor ![SVG Font Editor Pane](/img/posts/fun-with-icon-fonts/svg-font-editor-pane.png)

So now comes the fun part. Draw something pretty! Keep in mind the colour constraint. Also be aware that you're basically going to flatten the image later, so anything you do with layering will also be ignored. I've chosen to excercise my artistic talent with this beautiful ball... thing. ![Ball Thing](/img/posts/fun-with-icon-fonts/ball-thing.png) Note that the redness of the outline and the fill will be lost when we turn this into a glyph. You'll see that in a moment.

The font specific stuff can be found under the *Text* menu. You'll want to open up the *SVG Font Editor Pane* if you haven't already.

If you haven't already made one, you'll need to make a new font in the Font Editor pane. You can ignore the name, (we can change it later in fontforge) but not the width. Make sure to set that to 1000. I forgot this time, and it will make fontforge angry at you later. ![New Font](/img/posts/fun-with-icon-fonts/new-font.png)

Head over to Glyphs, and add a new glyph. Name it something informative by double clicking on the name and changing it to whatever. Do the same for the matching string. ![Defining a glyph](/img/posts/fun-with-icon-fonts/glyph-define.png)

Again, this can be altered later in FontForge (and will be in the case of the string). Then select your path in the main window, and hit Get curves from selection. This should set the chosen glyph to use your current path. If you type the matching string into the Sample Text field it should show up just above it. ![Getting curves](/img/posts/fun-with-icon-fonts/glyph-got-curves.png)

Ok. So at this point we can skip out of inkscape and make a font with our one glyph. If you want to do that, skip ahead a bit. There are a few more little things that you should learn with regard to inkscape however: Layers, Squishing and Converting paths.

If you want to add more glyphs (which you should. One glyph per font will drive you insane with the CSS and be horrifically inefficent.), you'll probably want to use layers to hide the current path. Open up the Layers Pane: ![Layers Pane](/img/posts/fun-with-icon-fonts/layers-pane.png) You can just hide and lock the current layer, but you'll probably want to name it something vaguely informative first. Usually I use the same name as in the *SVG Font Editor* bit. ![Layer Hiding](/img/posts/fun-with-icon-fonts/layer-hiding.png)

What ever you do, don't delete it. You'll tempt Murphy and his law - if later on you have the wrong glyph selected when you hit *Get Curves from Selection*, it'll be overwritten. And no, it doesn't ask for confirmation or anything like that. As far as I know, you can't just use undo on it. Yeah. I made that mistake. Only the once. (Ok, like four times.)

So anyway, lets go ahead and create a new layer and deal with Path Conversion.

This time, I've used the pen tool to make some fancy curve. ![Fancy curve](/img/posts/fun-with-icon-fonts/fancy-curve.png) You can adjust the thickness of the stroke and whatever in the *Fill and Stroke Pane*. So let's add another glyph to our font in the *SVG Font Pane*, and hit the magic button, *Get Curves from Selection*... ![Mistakes were made](/img/posts/fun-with-icon-fonts/mistakes.png) and we (ok, I) screwed it up. Not only did I overwrite the beauty of my circle, but also the glyph looks nothing like what I expected it to. Ok. 

Fixing the glyph overwriting is easy thanks to layers, ![Fixed overwritten glyph](/img/posts/fun-with-icon-fonts/fixed.png) but now there's still the issue of the malformed glyph over there. First a slight detour to the aforementioned *Stroke and Fill Pane* to make my curve more curvy, then this is where the whole path conversion thing comes in. If we just hit Path -> Stroke to Path and then *Get Curves from Selection* we should get exactly what we're looking for: ![Fancy, glyphified curve](/img/posts/fun-with-icon-fonts/glyph-curve.png)

The last thing that might be important if you're making something complex (like the globe logo you've seen plastered all over this website.) is what I crudely termed Squishing paths. I don't have any images for this, but basically you can use the tools under the Path menu (Union, Difference, Intersection etc.) to combine multiple paths into one for conversion into a glyph.

Combine and Break Apart look tempting, however as far as I know, they only work on objects, and therefore aren't that useful to us "font-artists".

So, now you can go ahead and save a copy of the SVG, and get cracking in fontforge.

Presuming you managed to open up the SVG in FontForge, you'll be presented with a grid of your glyphs, hopefully. ![Fontforge Grid](/img/posts/fun-with-icon-fonts/fontforge-glyph-grid.png) So. Now we have to assign all of the glyphs unicode code points. I recommend using the ones from the [Private Use Areas](http://en.wikipedia.org/wiki/Private_Use_(Unicode)), since they won't get picked up by screen readers or anything, and it seems like the logical place to put whatever weird logo you've come up with. Since we're defining our own font, you could use whatever value you want, however. 

So, right click on one of your glyphs, then hit *Glyph Info*. You'll get a window where you can give the glyph a name (Pick something logical. You'll probably want to keep this consistent if you do the whole CSS @font-face and i tag thing.) and set the unicode value for the character. ![Glyph Info Window](/img/posts/fun-with-icon-fonts/fontforge-glyph-info.png) Basically, do that for all your glyphs. 

Once you've got that sussed, hit Element -> Font Properties. Here you can define all the details for your font. It should all be fairly self explanatory. ![Font Properties](/img/posts/fun-with-icon-fonts/fontforge-font-info.png)

Once that's done, save your font again (preferably in the FontForge format, .sfd) and start exporting in all the different formats you want. I'd recommend at least doing ttf and woff. You'll probably want to get it into eot, which font-forge unfortunately can't natively produce (It's a format created by Microsoft for IE, so go figure.). [This](http://onlinefontconverter.com/) website should allow you to convert it to .eot, along with a bunch of other random formats if you feel like that kind of thing.

You might run into some errors during export. Most of these can be fixed with the tools in fontforge, right clicking on the appropriate glyphs should give you options to convert to integer variables, correct direction and AutoHint. You can find the option to fix the extrema error in Element -> Add Extrema.

So now that that's done, we need to make some CSS. Here's what I've used, it's basically taken directly from [FontAwesome](http://fortawesome.github.com/Font-Awesome/):

	@font-face {
	  font-family: 'byatlas-iconfont';
	  src: url('/assets/font/byatlas-iconfont.eot');
	  src: url('/assets/font/byatlas-iconfont.eot') format('embedded-opentype'),
	    url('/assets/font/byatlas-iconfont.woff') format('woff'),
	    url('/assets/font/byatlas-iconfont.ttf') format('truetype');
	  font-weight: normal;
	  font-style: normal;
	}
	[class^="icon-"],
	[class*=" icon-"] {
	  font-family: byatlas-iconfont;
	  font-weight: normal;
	  font-style: normal;
	  text-decoration: inherit;
	  -webkit-font-smoothing: antialiased;

	  /* sprites.less reset */
	  display: inline;
	  width: auto;
	  height: auto;
	  line-height: normal;
	  vertical-align: baseline;
	  background-image: none;
	  background-position: 0% 0%;
	  background-repeat: repeat;
	  margin-top: 0;
	}
	.icon-globe:before    { content: "\f0000";}
	.icon-half-globe:before    { content: "\f0001";}
	.icon-twitter:before		{ content: "\f0002"; }
	.icon-github:before		{ content: "\f0003"; }

Hopefully all the parameters there are, again, self explanatory. The bits right down the bottom are used to produce the i tags that everyone loves so much. If you don't want to do that, just so long as you enclose your text with tags that have the correct font-family set, you can use this type of thing:

	&#983040;
	&#983041;

And so on. Those are just the hex values converted to decimal, prefixed with &# and ending with ;. Much like how you use &nsbp and the like.

So hopefully you've made your shiny new startup or whatever even shinier now with svelte, lightweight icon fonts. You are going to cut me in on a slice of the profits, right?

Don't make another wingdings,

ATLAS
-----