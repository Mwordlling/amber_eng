var req = (function(){

    var module = {}

        // registered resources by name
        , map = {}
        ;

    module.reg = function(resource_name, loader, first_param) {
        var args = Array.prototype.slice.call(arguments, 2);

        map[resource_name] = {
            loader: loader,
            params: args,
            listeners: [],
            tries: 0
        };

        return module;
    };

    module.need = function(resource_name) {
        return new Need([resource_name]);
    };

    module.needAll = function(array_of_names) {
        return new Need(array_of_names);
    };

    function Need(resources) {
        this.resources = resources || [];
    }

    Need.prototype.push = function(r) {
        this.resources.push(r)
    };

    Need.prototype.need = function(resource_name) {
        this.push(resource_name);
        return this;
    };

    Need.prototype.needAll = function(array_of_names) {
        Array.prototype.push.apply(this.resources, array_of_names);
        return this;
    };

    Need.prototype.ready = function(ready_cb) {
        var q = d3.queue();
        this.resources.forEach(function(r) {q = q.defer(retrieve, r)});
        q.await(ready_cb);
    };

    Need.prototype.readyAll = function(ready_cb) {
        var q = d3.queue();
        this.resources.forEach(function(r) {q = q.defer(retrieve, r)});
        q.awaitAll(ready_cb);
    };

    function retrieve(r_name, cb) {
        var meta = map[r_name];
        if (!meta) throw "Resource is not registered! " + r_name;


        if (meta.status === 'ready') {
            cb(null, meta.data);
            return;
        }

        if (meta.status === 'working') {
            meta.listeners.push(cb);
            return;
        }

        meta.listeners.push(cb);
        meta.status = 'working';
        meta.loader.apply(null, meta.params.concat([function (err, data) {
            meta.tries++;

            meta.status = 'ready';
            meta.data = data;

            return notifyAll(meta.listeners, meta.data);
        }]));
    }

    function notifyAll(listeners, data) {
        listeners.forEach(function(l) {
            l(null, data);
        });
        listeners.length = 0;
    }

    return module;
})();
