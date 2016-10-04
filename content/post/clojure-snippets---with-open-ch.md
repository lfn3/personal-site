+++
date = "2016-10-04T23:00:00+13:00"
draft = true
title = "Clojure snippets - with-open-ch"

+++

Here's a little macro I've used in tests quite a bit to reduce the amount of boilerplate for cleanup:

```
(defmacro with-open-ch [bindings & body]
  `(let [~@bindings]
     ~@body
     (doseq [ch# (reverse (map first (partition 2 ~bindings)))]
       (a/close! ch#))))
```

TODO: Explain bits.