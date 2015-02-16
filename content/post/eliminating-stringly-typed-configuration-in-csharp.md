+++
date = "2015-02-16T23:10:24+13:00"
draft = true
title = "Eliminating Stringly Typed Config in C#"

+++

Be forewarned. This involves evil runtime code generation, remoting across app domains, and all kinds of other black magic. But you know, you get solid static typing out the other side, so maybe it's the lesser of two evils? Coming from a python guy, who's digging into a lisp, dynamism is fine!

So as you might have gathered, the techniques I'm about to show you will somewhat contort any existing workflow. You can possibly drop the requirement for another app domain, this will however mean you need to restart your app whenever you make a config change that would trigger a code regen. This is because you can't unload an assembly from an app domain, you have to blow it away in order to reload something with the same name. So the code that does the generation should probably live in one dll, and spin up another app domain when it generates code to host the generated dll.