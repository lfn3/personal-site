+++
date = "2018-01-09T08:23:00+13:00"
draft = false
title = "The unreasonable effectiveness of checklists"

+++

One of the things we did recently was start using a checklist once we think we've 'completed' a story.
The checklist is basically just a big list of features that already exist in our codebase, and some notable gotchas
that have caught us out before. All we do is go through it and ask ourselves if what we've just written interacts with
that feature or gotcha, and if so, have we written a test for it?

<!--more-->

The checklist is pretty long as a result, and constantly changing, but still really useful, especially considering the 
amount of effort that goes into it is ~5 minutes per story. In spite of us knowing we're going to go through the 
checklist, we still pretty much always turn up something, either a test that needs writing or some unexpected, broken
interaction.

All you have to do is sit down and spent 15 minutes writing a list in markdown of all the major things your 
codebase does. Every time you think you're done with a bit of work, take a copy, delete everything that's irrelevant,
and tick everything you've got a test for. Anything that's left, well there's something that's at least untested, and 
maybe if you think about it, buggy. The only other thing we do is try to add to the template when we introduce a bug 
that is due to unexpected interaction between what we're writing, and some other feature.

For us, the return on investment for this has been exceptional. We've caught enough issues that the tiny amount of time
we've spent on this has more than paid for itself. And we're not the 
[only ones](https://www.ncbi.nlm.nih.gov/pubmed/23579353).