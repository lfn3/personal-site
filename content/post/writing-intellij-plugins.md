+++
date = "2017-05-27T10:21:00+12:00"
draft = false
title = "Writing IntelliJ plugins"

+++

I've spent some time working on an IntelliJ plugin during our free time at work.
There's quite a bit of stuff I've learned from either reading source or messing
with things until they worked, and I thought I'd record some of that.

You'll need some knowledge of how IntelliJ plugins work, mostly about the Psi
model and it's API. If you want to learn about that, you should probably start
with [this](http://www.jetbrains.org/intellij/sdk/docs/basics/architectural_overview/psi_files.html)
or [this](http://www.jetbrains.org/intellij/sdk/docs/basics/architectural_overview/psi_elements.html).
Anyway, tip #1 - PsiTrees are sensitive about what elements you put where.

<!--more-->

The problem I was having was that after inserting an annotation I'd generated on
a variable, the code analysis was freaking out about it being in the wrong place.

This was inside a quickfix, and the code in question looked something like this:
```java
PsiElementFactory factory = JavaPsiFacade.getElementFactory(project);

PsiAnnotation annotation = factory.createAnnotationFromText(
  "@" + annotationToApply.getSubtypeFQN(),
  variableToAnnotate.getContainingFile());

if (variableToAnnotate != null) {
    variableToAnnotate.addBefore(annotation,
                                 variableToAnnotate.getTypeElement());
}
```

The code it was generating looked correct after it'd been output, but I was
getting complaints that "annotations are not allowed here".

![annotations not allowed here](/img/posts/writing-intellij-plugins/after-quickfix.png)

Along with it not showing the inspection I'd fixed as being fixed. (You can see
the quickfix is still available). I had a look at the PsiTree and it looked
correct.

![psitree](/img/posts/writing-intellij-plugins/psi-tree.png)

You can see the annotation element is there, inside the modifier list. There's
one thing that's important to know about the Psi Viewer: It reparses the code in
question, it doesn't use the same PsiTree as the editor does for file you're
looking at.

Hopefully that should give away the issue: I was putting the annotation directly
under the variable PsiElement, rather than inside a ModifierList. The fix was
pretty simple, what I ended up doing was this:

```java
PsiElementFactory factory = JavaPsiFacade.getElementFactory(project);

PsiAnnotation annotation = factory.createAnnotationFromText(
  "@" + annotationToApply.getSubtypeFQN(),
  variableToAnnotate.getContainingFile());

if (variableToAnnotate != null &&
    variableToAnnotate.getModifierList() != null) {
  variableToAnnotate.getModifierList().add(annotation);
}
```

Rather than just putting the annotation on the variable, I pull out the modifier
list and put it on the end.

It seems like every variable has a modifier list regardless of if it actually
has any modifiers, i.e. at worst there should be an empty list. So the null
check there is probably a little overly defensive.

I've got a bunch more similar stories tucked away in my brain, so hopefully this
can be a series that I might actually write semi-regularly, unlike the scattered
posts I otherwise make...
