+++
date = "2018-02-13T12:35:40+13:00"
draft = true
title = "JDBC & ResultSets are nuts"
+++

So today I was kicking around our codebase, changing some sql so it points at a replicated version of our data.
One of the values hadn't been persisted in the replica, which was causing issues when attempting to update the master
version (The master retains history, the replicas don't). So I fixed that up, ran some tests, and started to see some
weird failures in a method I cleaned up a bit by removing an unnecessary variable and reusing an existing function. 

The bit of code I ended up writing looked something like this: 
```java
class BarMapper {
    private static Bar mapToBar(final ResultSet rs, final int rowNum)
    {
        int barValue = rs.getString("barVal");
        
        if (rs.wasNull())
        {
            return null;
        }
        
        return new Bar(barValue, mapToFoo(rs, rowNum));
    }
    
    private static Foo mapToFoo(final ResultSet rs, final int rowNum)
    {
        return Foo(rs.getInt("id"));
    }
}
```

What do you think this bit of code does?

<!--more-->

You'd think with a name like `getInt` that it'd be a simple getter, maybe just mapping to the row we'd stashed in memory.
You'd be wrong. The reason stuff was breaking was because the code used to look something like this:

```java
class BarMapper
{
       
    private static Bar map(final ResultSet rs, final int rowNum)
    {
        int id = rs.getInt();
    }
    
    private static Foo map(final ResultSet rs, final int rowNum)
    {
        return Foo(rs.getInt("id"));
    }
}
```

