
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules\svelte-fa\src\fa.svelte generated by Svelte v3.38.2 */

    const file$7 = "node_modules\\svelte-fa\\src\\fa.svelte";

    // (104:0) {#if i[4]}
    function create_if_block$3(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let svg_viewBox_value;

    	function select_block_type(ctx, dirty) {
    		if (typeof /*i*/ ctx[8][4] == "string") return create_if_block_1$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			if_block.c();
    			attr_dev(g0, "transform", /*transform*/ ctx[10]);
    			add_location(g0, file$7, 116, 6, 2052);
    			attr_dev(g1, "transform", "translate(256 256)");
    			add_location(g1, file$7, 113, 4, 2000);
    			attr_dev(svg, "id", /*id*/ ctx[1]);
    			attr_dev(svg, "class", /*clazz*/ ctx[0]);
    			attr_dev(svg, "style", /*s*/ ctx[9]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = `0 0 ${/*i*/ ctx[8][0]} ${/*i*/ ctx[8][1]}`);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$7, 104, 2, 1830);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			if_block.m(g0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g0, null);
    				}
    			}

    			if (dirty & /*transform*/ 1024) {
    				attr_dev(g0, "transform", /*transform*/ ctx[10]);
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(svg, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*clazz*/ 1) {
    				attr_dev(svg, "class", /*clazz*/ ctx[0]);
    			}

    			if (dirty & /*s*/ 512) {
    				attr_dev(svg, "style", /*s*/ ctx[9]);
    			}

    			if (dirty & /*i*/ 256 && svg_viewBox_value !== (svg_viewBox_value = `0 0 ${/*i*/ ctx[8][0]} ${/*i*/ ctx[8][1]}`)) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(104:0) {#if i[4]}",
    		ctx
    	});

    	return block;
    }

    // (124:8) {:else}
    function create_else_block$3(ctx) {
    	let path0;
    	let path0_d_value;
    	let path0_fill_value;
    	let path0_fill_opacity_value;
    	let path1;
    	let path1_d_value;
    	let path1_fill_value;
    	let path1_fill_opacity_value;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", path0_d_value = /*i*/ ctx[8][4][0]);
    			attr_dev(path0, "fill", path0_fill_value = /*secondaryColor*/ ctx[4] || /*color*/ ctx[2] || "currentColor");

    			attr_dev(path0, "fill-opacity", path0_fill_opacity_value = /*swapOpacity*/ ctx[7] != false
    			? /*primaryOpacity*/ ctx[5]
    			: /*secondaryOpacity*/ ctx[6]);

    			attr_dev(path0, "transform", "translate(-256 -256)");
    			add_location(path0, file$7, 124, 10, 2286);
    			attr_dev(path1, "d", path1_d_value = /*i*/ ctx[8][4][1]);
    			attr_dev(path1, "fill", path1_fill_value = /*primaryColor*/ ctx[3] || /*color*/ ctx[2] || "currentColor");

    			attr_dev(path1, "fill-opacity", path1_fill_opacity_value = /*swapOpacity*/ ctx[7] != false
    			? /*secondaryOpacity*/ ctx[6]
    			: /*primaryOpacity*/ ctx[5]);

    			attr_dev(path1, "transform", "translate(-256 -256)");
    			add_location(path1, file$7, 130, 10, 2529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 256 && path0_d_value !== (path0_d_value = /*i*/ ctx[8][4][0])) {
    				attr_dev(path0, "d", path0_d_value);
    			}

    			if (dirty & /*secondaryColor, color*/ 20 && path0_fill_value !== (path0_fill_value = /*secondaryColor*/ ctx[4] || /*color*/ ctx[2] || "currentColor")) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty & /*swapOpacity, primaryOpacity, secondaryOpacity*/ 224 && path0_fill_opacity_value !== (path0_fill_opacity_value = /*swapOpacity*/ ctx[7] != false
    			? /*primaryOpacity*/ ctx[5]
    			: /*secondaryOpacity*/ ctx[6])) {
    				attr_dev(path0, "fill-opacity", path0_fill_opacity_value);
    			}

    			if (dirty & /*i*/ 256 && path1_d_value !== (path1_d_value = /*i*/ ctx[8][4][1])) {
    				attr_dev(path1, "d", path1_d_value);
    			}

    			if (dirty & /*primaryColor, color*/ 12 && path1_fill_value !== (path1_fill_value = /*primaryColor*/ ctx[3] || /*color*/ ctx[2] || "currentColor")) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty & /*swapOpacity, secondaryOpacity, primaryOpacity*/ 224 && path1_fill_opacity_value !== (path1_fill_opacity_value = /*swapOpacity*/ ctx[7] != false
    			? /*secondaryOpacity*/ ctx[6]
    			: /*primaryOpacity*/ ctx[5])) {
    				attr_dev(path1, "fill-opacity", path1_fill_opacity_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(124:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (118:8) {#if typeof i[4] == 'string'}
    function create_if_block_1$2(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*i*/ ctx[8][4]);
    			attr_dev(path, "fill", path_fill_value = /*color*/ ctx[2] || /*primaryColor*/ ctx[3] || "currentColor");
    			attr_dev(path, "transform", "translate(-256 -256)");
    			add_location(path, file$7, 118, 10, 2116);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 256 && path_d_value !== (path_d_value = /*i*/ ctx[8][4])) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*color, primaryColor*/ 12 && path_fill_value !== (path_fill_value = /*color*/ ctx[2] || /*primaryColor*/ ctx[3] || "currentColor")) {
    				attr_dev(path, "fill", path_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(118:8) {#if typeof i[4] == 'string'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let if_block = /*i*/ ctx[8][4] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*i*/ ctx[8][4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fa", slots, []);
    	let { class: clazz = "" } = $$props;
    	let { id = "" } = $$props;
    	let { style = "" } = $$props;
    	let { icon } = $$props;
    	let { fw = false } = $$props;
    	let { flip = false } = $$props;
    	let { pull = false } = $$props;
    	let { rotate = false } = $$props;
    	let { size = false } = $$props;
    	let { color = "" } = $$props;
    	let { primaryColor = "" } = $$props;
    	let { secondaryColor = "" } = $$props;
    	let { primaryOpacity = 1 } = $$props;
    	let { secondaryOpacity = 0.4 } = $$props;
    	let { swapOpacity = false } = $$props;
    	let i;
    	let s;
    	let transform;

    	const writable_props = [
    		"class",
    		"id",
    		"style",
    		"icon",
    		"fw",
    		"flip",
    		"pull",
    		"rotate",
    		"size",
    		"color",
    		"primaryColor",
    		"secondaryColor",
    		"primaryOpacity",
    		"secondaryOpacity",
    		"swapOpacity"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fa> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, clazz = $$props.class);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("icon" in $$props) $$invalidate(12, icon = $$props.icon);
    		if ("fw" in $$props) $$invalidate(13, fw = $$props.fw);
    		if ("flip" in $$props) $$invalidate(14, flip = $$props.flip);
    		if ("pull" in $$props) $$invalidate(15, pull = $$props.pull);
    		if ("rotate" in $$props) $$invalidate(16, rotate = $$props.rotate);
    		if ("size" in $$props) $$invalidate(17, size = $$props.size);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("primaryColor" in $$props) $$invalidate(3, primaryColor = $$props.primaryColor);
    		if ("secondaryColor" in $$props) $$invalidate(4, secondaryColor = $$props.secondaryColor);
    		if ("primaryOpacity" in $$props) $$invalidate(5, primaryOpacity = $$props.primaryOpacity);
    		if ("secondaryOpacity" in $$props) $$invalidate(6, secondaryOpacity = $$props.secondaryOpacity);
    		if ("swapOpacity" in $$props) $$invalidate(7, swapOpacity = $$props.swapOpacity);
    	};

    	$$self.$capture_state = () => ({
    		clazz,
    		id,
    		style,
    		icon,
    		fw,
    		flip,
    		pull,
    		rotate,
    		size,
    		color,
    		primaryColor,
    		secondaryColor,
    		primaryOpacity,
    		secondaryOpacity,
    		swapOpacity,
    		i,
    		s,
    		transform
    	});

    	$$self.$inject_state = $$props => {
    		if ("clazz" in $$props) $$invalidate(0, clazz = $$props.clazz);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("icon" in $$props) $$invalidate(12, icon = $$props.icon);
    		if ("fw" in $$props) $$invalidate(13, fw = $$props.fw);
    		if ("flip" in $$props) $$invalidate(14, flip = $$props.flip);
    		if ("pull" in $$props) $$invalidate(15, pull = $$props.pull);
    		if ("rotate" in $$props) $$invalidate(16, rotate = $$props.rotate);
    		if ("size" in $$props) $$invalidate(17, size = $$props.size);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("primaryColor" in $$props) $$invalidate(3, primaryColor = $$props.primaryColor);
    		if ("secondaryColor" in $$props) $$invalidate(4, secondaryColor = $$props.secondaryColor);
    		if ("primaryOpacity" in $$props) $$invalidate(5, primaryOpacity = $$props.primaryOpacity);
    		if ("secondaryOpacity" in $$props) $$invalidate(6, secondaryOpacity = $$props.secondaryOpacity);
    		if ("swapOpacity" in $$props) $$invalidate(7, swapOpacity = $$props.swapOpacity);
    		if ("i" in $$props) $$invalidate(8, i = $$props.i);
    		if ("s" in $$props) $$invalidate(9, s = $$props.s);
    		if ("transform" in $$props) $$invalidate(10, transform = $$props.transform);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 4096) {
    			$$invalidate(8, i = icon && icon.icon || [0, 0, "", [], ""]);
    		}

    		if ($$self.$$.dirty & /*fw, pull, size, style*/ 174080) {
    			{
    				let float;
    				let width;
    				const height = "1em";
    				let lineHeight;
    				let fontSize;
    				let textAlign;
    				let verticalAlign = "-.125em";
    				const overflow = "visible";

    				if (fw) {
    					textAlign = "center";
    					width = "1.25em";
    				}

    				if (pull) {
    					float = pull;
    				}

    				if (size) {
    					if (size == "lg") {
    						fontSize = "1.33333em";
    						lineHeight = ".75em";
    						verticalAlign = "-.225em";
    					} else if (size == "xs") {
    						fontSize = ".75em";
    					} else if (size == "sm") {
    						fontSize = ".875em";
    					} else {
    						fontSize = size.replace("x", "em");
    					}
    				}

    				const styleObj = {
    					float,
    					width,
    					height,
    					"line-height": lineHeight,
    					"font-size": fontSize,
    					"text-align": textAlign,
    					"vertical-align": verticalAlign,
    					overflow
    				};

    				let styleStr = "";

    				for (const prop in styleObj) {
    					if (styleObj[prop]) {
    						styleStr += `${prop}:${styleObj[prop]};`;
    					}
    				}

    				$$invalidate(9, s = styleStr + style);
    			}
    		}

    		if ($$self.$$.dirty & /*flip, rotate*/ 81920) {
    			{
    				let t = "";

    				if (flip) {
    					let flipX = 1;
    					let flipY = 1;

    					if (flip == "horizontal") {
    						flipX = -1;
    					} else if (flip == "vertical") {
    						flipY = -1;
    					} else {
    						flipX = flipY = -1;
    					}

    					t += ` scale(${flipX} ${flipY})`;
    				}

    				if (rotate) {
    					t += ` rotate(${rotate} 0 0)`;
    				}

    				$$invalidate(10, transform = t);
    			}
    		}
    	};

    	return [
    		clazz,
    		id,
    		color,
    		primaryColor,
    		secondaryColor,
    		primaryOpacity,
    		secondaryOpacity,
    		swapOpacity,
    		i,
    		s,
    		transform,
    		style,
    		icon,
    		fw,
    		flip,
    		pull,
    		rotate,
    		size
    	];
    }

    class Fa extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 0,
    			id: 1,
    			style: 11,
    			icon: 12,
    			fw: 13,
    			flip: 14,
    			pull: 15,
    			rotate: 16,
    			size: 17,
    			color: 2,
    			primaryColor: 3,
    			secondaryColor: 4,
    			primaryOpacity: 5,
    			secondaryOpacity: 6,
    			swapOpacity: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fa",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[12] === undefined && !("icon" in props)) {
    			console.warn("<Fa> was created without expected prop 'icon'");
    		}
    	}

    	get class() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fw() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fw(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flip() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pull() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pull(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryColor() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryColor(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryColor() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryColor(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get swapOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set swapOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*!
     * Font Awesome Free 5.15.3 by @fontawesome - https://fontawesome.com
     * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
     */
    var faSync = {
      prefix: 'fas',
      iconName: 'sync',
      icon: [512, 512, [], "f021", "M440.65 12.57l4 82.77A247.16 247.16 0 0 0 255.83 8C134.73 8 33.91 94.92 12.29 209.82A12 12 0 0 0 24.09 224h49.05a12 12 0 0 0 11.67-9.26 175.91 175.91 0 0 1 317-56.94l-101.46-4.86a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12H500a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12h-47.37a12 12 0 0 0-11.98 12.57zM255.83 432a175.61 175.61 0 0 1-146-77.8l101.8 4.87a12 12 0 0 0 12.57-12v-47.4a12 12 0 0 0-12-12H12a12 12 0 0 0-12 12V500a12 12 0 0 0 12 12h47.35a12 12 0 0 0 12-12.6l-4.15-82.57A247.17 247.17 0 0 0 255.83 504c121.11 0 221.93-86.92 243.55-201.82a12 12 0 0 0-11.8-14.18h-49.05a12 12 0 0 0-11.67 9.26A175.86 175.86 0 0 1 255.83 432z"]
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const url = "https://api.binance.com/api/v1/ticker/24hr";

    const coinStore = writable([]);

    /* src\components\Header.svelte generated by Svelte v3.38.2 */
    const file$6 = "src\\components\\Header.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*title*/ ctx[0]);
    			attr_dev(div, "class", "title");
    			add_location(div, file$6, 5, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { title = "Coin stats" } = $$props;
    	const writable_props = ["title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ title });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get title() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-atoms\Typography.svelte generated by Svelte v3.38.2 */

    const file$5 = "node_modules\\svelte-atoms\\Typography.svelte";

    function create_fragment$5(ctx) {
    	let span;
    	let span_class_value;
    	let span_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(`aa-typography ${/*type*/ ctx[0].toLowerCase()} ${/*$$props*/ ctx[2].class || ""}`) + " svelte-2vpi93"));
    			attr_dev(span, "style", span_style_value = /*$$props*/ ctx[2].style || "");
    			toggle_class(span, "block", /*block*/ ctx[1]);
    			add_location(span, file$5, 5, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type, $$props*/ 5 && span_class_value !== (span_class_value = "" + (null_to_empty(`aa-typography ${/*type*/ ctx[0].toLowerCase()} ${/*$$props*/ ctx[2].class || ""}`) + " svelte-2vpi93"))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 4 && span_style_value !== (span_style_value = /*$$props*/ ctx[2].style || "")) {
    				attr_dev(span, "style", span_style_value);
    			}

    			if (dirty & /*type, $$props, block*/ 7) {
    				toggle_class(span, "block", /*block*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Typography", slots, ['default']);
    	let { type = "body1" } = $$props;
    	let { block = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("block" in $$new_props) $$invalidate(1, block = $$new_props.block);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, block });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    		if ("block" in $$props) $$invalidate(1, block = $$new_props.block);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [type, block, $$props, $$scope, slots];
    }

    class Typography extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { type: 0, block: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typography",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get type() {
    		throw new Error("<Typography>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Typography>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Typography>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Typography>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* node_modules\svelte-atoms\Popup.svelte generated by Svelte v3.38.2 */
    const file$4 = "node_modules\\svelte-atoms\\Popup.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (45:4) {#if isOpen}
    function create_if_block$2(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let t0;
    	let div1;
    	let typography;
    	let t1;
    	let div2;
    	let div3_transition;
    	let div4_class_value;
    	let div4_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*header*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	typography = new Typography({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const footer_slot_template = /*#slots*/ ctx[8].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[12], get_footer_slot_context);
    	const footer_slot_or_fallback = footer_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			div1 = element("div");
    			create_component(typography.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			if (footer_slot_or_fallback) footer_slot_or_fallback.c();
    			attr_dev(div0, "class", "svelte-1dhy857");
    			toggle_class(div0, "header", /*header*/ ctx[0] || !Boolean(/*headerRef*/ ctx[4]));
    			add_location(div0, file$4, 53, 10, 1377);
    			attr_dev(div1, "class", "content svelte-1dhy857");
    			add_location(div1, file$4, 63, 10, 1686);
    			attr_dev(div2, "class", "svelte-1dhy857");
    			toggle_class(div2, "footer", !Boolean(/*footerRef*/ ctx[3]));
    			add_location(div2, file$4, 68, 10, 1809);
    			attr_dev(div3, "class", "aa-popup svelte-1dhy857");
    			add_location(div3, file$4, 49, 8, 1214);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(`overlay ${/*$$props*/ ctx[6].class || ""}`) + " svelte-1dhy857"));
    			add_location(div4, file$4, 45, 6, 1096);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			mount_component(typography, div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			if (footer_slot_or_fallback) {
    				footer_slot_or_fallback.m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", click_handler, false, false, false),
    					listen_dev(div4, "click", /*close*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}

    			if (dirty & /*header, Boolean, headerRef*/ 17) {
    				toggle_class(div0, "header", /*header*/ ctx[0] || !Boolean(/*headerRef*/ ctx[4]));
    			}

    			const typography_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				typography_changes.$$scope = { dirty, ctx };
    			}

    			typography.$set(typography_changes);

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_footer_slot_changes, get_footer_slot_context);
    				}
    			} else {
    				if (footer_slot_or_fallback && footer_slot_or_fallback.p && dirty & /*footerRef*/ 8) {
    					footer_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (dirty & /*Boolean, footerRef*/ 8) {
    				toggle_class(div2, "footer", !Boolean(/*footerRef*/ ctx[3]));
    			}

    			if (!current || dirty & /*$$props*/ 64 && div4_class_value !== (div4_class_value = "" + (null_to_empty(`overlay ${/*$$props*/ ctx[6].class || ""}`) + " svelte-1dhy857"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(typography.$$.fragment, local);
    			transition_in(footer_slot_or_fallback, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fly, { duration: 300, y: -500, opacity: 0.9 }, true);
    					div3_transition.run(1);
    				});
    			}

    			if (local) {
    				add_render_callback(() => {
    					if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, true);
    					div4_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(typography.$$.fragment, local);
    			transition_out(footer_slot_or_fallback, local);

    			if (local) {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fly, { duration: 300, y: -500, opacity: 0.9 }, false);
    				div3_transition.run(0);
    			}

    			if (local) {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, false);
    				div4_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_blocks[current_block_type_index].d();
    			destroy_component(typography);
    			if (footer_slot_or_fallback) footer_slot_or_fallback.d(detaching);
    			if (detaching && div3_transition) div3_transition.end();
    			if (detaching && div4_transition) div4_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(45:4) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    // (57:12) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const header_slot_template = /*#slots*/ ctx[8].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[12], get_header_slot_context);
    	const header_slot_or_fallback = header_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (header_slot_or_fallback) header_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (header_slot_or_fallback) {
    				header_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			} else {
    				if (header_slot_or_fallback && header_slot_or_fallback.p && dirty & /*headerRef*/ 16) {
    					header_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (header_slot_or_fallback) header_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(57:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:12) {#if header}
    function create_if_block_1$1(ctx) {
    	let typography;
    	let current;

    	typography = new Typography({
    			props: {
    				type: "headline",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(typography.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(typography, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const typography_changes = {};

    			if (dirty & /*$$scope, header*/ 4097) {
    				typography_changes.$$scope = { dirty, ctx };
    			}

    			typography.$set(typography_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(typography.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(typography.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(typography, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(55:12) {#if header}",
    		ctx
    	});

    	return block;
    }

    // (58:34)                  
    function fallback_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$4, 58, 16, 1588);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[9](div);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(58:34)                  ",
    		ctx
    	});

    	return block;
    }

    // (56:14) <Typography type="headline">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*header*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*header*/ 1) set_data_dev(t, /*header*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(56:14) <Typography type=\\\"headline\\\">",
    		ctx
    	});

    	return block;
    }

    // (65:12) <Typography>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(65:12) <Typography>",
    		ctx
    	});

    	return block;
    }

    // (70:32)                
    function fallback_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$4, 70, 14, 1897);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding_1*/ ctx[10](div);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding_1*/ ctx[10](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(70:32)                ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let if_block = /*isOpen*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			add_location(div0, file$4, 43, 2, 1046);
    			add_location(div1, file$4, 42, 0, 1038);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			/*div0_binding*/ ctx[11](div0);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			/*div0_binding*/ ctx[11](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler = e => e.stopPropagation();

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Popup", slots, ['header','default','footer']);
    	let { header = "" } = $$props;
    	let { isOpen = false } = $$props;
    	let popupRef;
    	let footerRef = null;
    	let headerRef = null;
    	let overflowState = "";
    	const dispatch = createEventDispatcher();

    	const close = () => {
    		dispatch("close", "");
    	};

    	const handleKeyDown = event => {
    		if (event.keyCode === 27) close();
    	};

    	onMount(() => {
    		window.addEventListener("keydown", handleKeyDown);
    		document.body.appendChild(popupRef);

    		return () => {
    			window.removeEventListener("keydown", handleKeyDown);
    			document.body.removeChild(popupRef);
    		};
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			headerRef = $$value;
    			$$invalidate(4, headerRef);
    		});
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			footerRef = $$value;
    			$$invalidate(3, footerRef);
    		});
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			popupRef = $$value;
    			$$invalidate(2, popupRef);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("header" in $$new_props) $$invalidate(0, header = $$new_props.header);
    		if ("isOpen" in $$new_props) $$invalidate(1, isOpen = $$new_props.isOpen);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Typography,
    		onMount,
    		fade,
    		fly,
    		createEventDispatcher,
    		header,
    		isOpen,
    		popupRef,
    		footerRef,
    		headerRef,
    		overflowState,
    		dispatch,
    		close,
    		handleKeyDown
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("header" in $$props) $$invalidate(0, header = $$new_props.header);
    		if ("isOpen" in $$props) $$invalidate(1, isOpen = $$new_props.isOpen);
    		if ("popupRef" in $$props) $$invalidate(2, popupRef = $$new_props.popupRef);
    		if ("footerRef" in $$props) $$invalidate(3, footerRef = $$new_props.footerRef);
    		if ("headerRef" in $$props) $$invalidate(4, headerRef = $$new_props.headerRef);
    		if ("overflowState" in $$props) $$invalidate(7, overflowState = $$new_props.overflowState);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isOpen, overflowState*/ 130) {
    			{
    				if (typeof window !== "undefined") {
    					if (isOpen) {
    						$$invalidate(7, overflowState = document.body.style.overflow);
    						document.body.style.overflow = "hidden";
    					} else {
    						document.body.style.overflow = overflowState;
    					}
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		header,
    		isOpen,
    		popupRef,
    		footerRef,
    		headerRef,
    		close,
    		$$props,
    		overflowState,
    		slots,
    		div_binding,
    		div_binding_1,
    		div0_binding,
    		$$scope
    	];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { header: 0, isOpen: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get header() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Modal.svelte generated by Svelte v3.38.2 */
    const file$3 = "src\\components\\Modal.svelte";

    // (50:10) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = `${/*percentatgePopup*/ ctx[3]}`;
    			add_location(div, file$3, 50, 12, 1445);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(50:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:10) {#if window.screen.width < desktop}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = `${/*percentatgePopupMobile*/ ctx[2]}`;
    			add_location(div, file$3, 48, 12, 1377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(48:10) {#if window.screen.width < desktop}",
    		ctx
    	});

    	return block;
    }

    // (62:10) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = `${/*weightAveragePopup*/ ctx[5]}`;
    			add_location(div, file$3, 62, 12, 1795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(62:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:10) {#if window.screen.width < desktop}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = `${/*weightAveragePopupMobile*/ ctx[4]}`;
    			add_location(div, file$3, 60, 12, 1725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(60:10) {#if window.screen.width < desktop}",
    		ctx
    	});

    	return block;
    }

    // (18:0) <Popup {isOpen} on:close={close}>
    function create_default_slot(ctx) {
    	let span;
    	let t1;
    	let table;
    	let tbody;
    	let tr0;
    	let td0;
    	let div0;
    	let t3;
    	let div1;
    	let t4_value = /*moneda*/ ctx[1].symbol + "";
    	let t4;
    	let t5;
    	let td1;
    	let div2;
    	let t7;
    	let div3;
    	let t8_value = /*moneda*/ ctx[1].lastPrice + "";
    	let t8;
    	let t9;
    	let tr1;
    	let td2;
    	let div4;
    	let t11;
    	let div5;
    	let t12_value = /*moneda*/ ctx[1].openPrice + "";
    	let t12;
    	let t13;
    	let td3;
    	let div6;
    	let t15;
    	let div7;
    	let t16_value = /*moneda*/ ctx[1].prevClosePrice + "";
    	let t16;
    	let t17;
    	let tr2;
    	let td4;
    	let div8;
    	let t19;
    	let div9;
    	let t20_value = /*moneda*/ ctx[1].priceChange + "";
    	let t20;
    	let t21;
    	let td5;
    	let t22;
    	let div10;
    	let t23_value = parseFloat(/*moneda*/ ctx[1].priceChangePercent).toFixed(2) + "";
    	let t23;
    	let t24;
    	let t25;
    	let tr3;
    	let td6;
    	let t26;
    	let div11;
    	let t27_value = /*moneda*/ ctx[1].weightedAvgPrice + "";
    	let t27;
    	let t28;
    	let td7;
    	let div12;
    	let t30;
    	let div13;
    	let t31_value = /*moneda*/ ctx[1].lastQty + "";
    	let t31;
    	let t32;
    	let tr4;
    	let td8;
    	let div14;
    	let t34;
    	let div15;
    	let t35_value = /*moneda*/ ctx[1].bidPrice + "";
    	let t35;
    	let t36;
    	let td9;
    	let div16;
    	let t38;
    	let div17;
    	let t39_value = /*moneda*/ ctx[1].bidQty + "";
    	let t39;
    	let t40;
    	let tr5;
    	let td10;
    	let div18;
    	let t42;
    	let div19;
    	let t43_value = /*moneda*/ ctx[1].askPrice + "";
    	let t43;
    	let t44;
    	let td11;
    	let div20;
    	let t46;
    	let div21;
    	let t47_value = /*moneda*/ ctx[1].askQty + "";
    	let t47;
    	let t48;
    	let tr6;
    	let td12;
    	let div22;
    	let t50;
    	let div23;
    	let t51_value = /*moneda*/ ctx[1].highPrice + "";
    	let t51;
    	let t52;
    	let td13;
    	let div24;
    	let t54;
    	let div25;
    	let t55_value = /*moneda*/ ctx[1].lowPrice + "";
    	let t55;
    	let t56;
    	let tr7;
    	let td14;
    	let div26;
    	let t58;
    	let div27;
    	let t59_value = /*moneda*/ ctx[1].volume + "";
    	let t59;
    	let t60;
    	let td15;
    	let div28;
    	let t62;
    	let div29;
    	let t63_value = /*moneda*/ ctx[1].quoteVolume + "";
    	let t63;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (window.screen.width < /*desktop*/ ctx[6]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (window.screen.width < /*desktop*/ ctx[6]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "X";
    			t1 = space();
    			table = element("table");
    			tbody = element("tbody");
    			tr0 = element("tr");
    			td0 = element("td");
    			div0 = element("div");
    			div0.textContent = "Coin:";
    			t3 = space();
    			div1 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			td1 = element("td");
    			div2 = element("div");
    			div2.textContent = "Last price:";
    			t7 = space();
    			div3 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			div4 = element("div");
    			div4.textContent = "Open price:";
    			t11 = space();
    			div5 = element("div");
    			t12 = text(t12_value);
    			t13 = space();
    			td3 = element("td");
    			div6 = element("div");
    			div6.textContent = "Previous close:";
    			t15 = space();
    			div7 = element("div");
    			t16 = text(t16_value);
    			t17 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			div8 = element("div");
    			div8.textContent = "Price change:";
    			t19 = space();
    			div9 = element("div");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			if_block0.c();
    			t22 = space();
    			div10 = element("div");
    			t23 = text(t23_value);
    			t24 = text("%");
    			t25 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			if_block1.c();
    			t26 = space();
    			div11 = element("div");
    			t27 = text(t27_value);
    			t28 = space();
    			td7 = element("td");
    			div12 = element("div");
    			div12.textContent = "Last quantity:";
    			t30 = space();
    			div13 = element("div");
    			t31 = text(t31_value);
    			t32 = space();
    			tr4 = element("tr");
    			td8 = element("td");
    			div14 = element("div");
    			div14.textContent = "Bid price:";
    			t34 = space();
    			div15 = element("div");
    			t35 = text(t35_value);
    			t36 = space();
    			td9 = element("td");
    			div16 = element("div");
    			div16.textContent = "Bid quantity:";
    			t38 = space();
    			div17 = element("div");
    			t39 = text(t39_value);
    			t40 = space();
    			tr5 = element("tr");
    			td10 = element("td");
    			div18 = element("div");
    			div18.textContent = "Ask Price:";
    			t42 = space();
    			div19 = element("div");
    			t43 = text(t43_value);
    			t44 = space();
    			td11 = element("td");
    			div20 = element("div");
    			div20.textContent = "Ask quantity:";
    			t46 = space();
    			div21 = element("div");
    			t47 = text(t47_value);
    			t48 = space();
    			tr6 = element("tr");
    			td12 = element("td");
    			div22 = element("div");
    			div22.textContent = "High price:";
    			t50 = space();
    			div23 = element("div");
    			t51 = text(t51_value);
    			t52 = space();
    			td13 = element("td");
    			div24 = element("div");
    			div24.textContent = "Low price:";
    			t54 = space();
    			div25 = element("div");
    			t55 = text(t55_value);
    			t56 = space();
    			tr7 = element("tr");
    			td14 = element("td");
    			div26 = element("div");
    			div26.textContent = "Volume:";
    			t58 = space();
    			div27 = element("div");
    			t59 = text(t59_value);
    			t60 = space();
    			td15 = element("td");
    			div28 = element("div");
    			div28.textContent = "Quote volume:";
    			t62 = space();
    			div29 = element("div");
    			t63 = text(t63_value);
    			attr_dev(span, "class", "closePopup");
    			add_location(span, file$3, 18, 2, 528);
    			add_location(div0, file$3, 23, 10, 659);
    			attr_dev(div1, "class", "popUpValue");
    			add_location(div1, file$3, 24, 10, 687);
    			add_location(td0, file$3, 22, 8, 643);
    			add_location(div2, file$3, 27, 10, 773);
    			attr_dev(div3, "class", "popUpValue");
    			add_location(div3, file$3, 28, 10, 807);
    			add_location(td1, file$3, 26, 8, 757);
    			add_location(tr0, file$3, 21, 6, 629);
    			add_location(div4, file$3, 33, 10, 921);
    			attr_dev(div5, "class", "popUpValue");
    			add_location(div5, file$3, 34, 10, 955);
    			add_location(td2, file$3, 32, 8, 905);
    			add_location(div6, file$3, 37, 10, 1044);
    			attr_dev(div7, "class", "popUpValue");
    			add_location(div7, file$3, 38, 10, 1082);
    			add_location(td3, file$3, 36, 8, 1028);
    			add_location(tr1, file$3, 31, 6, 891);
    			add_location(div8, file$3, 43, 10, 1201);
    			attr_dev(div9, "class", "popUpValue");
    			add_location(div9, file$3, 44, 10, 1237);
    			add_location(td4, file$3, 42, 8, 1185);
    			attr_dev(div10, "class", "popUpValue");
    			add_location(div10, file$3, 52, 10, 1503);
    			add_location(td5, file$3, 46, 8, 1312);
    			add_location(tr2, file$3, 41, 6, 1171);
    			attr_dev(div11, "class", "popUpValue");
    			add_location(div11, file$3, 64, 10, 1855);
    			add_location(td6, file$3, 58, 8, 1660);
    			add_location(div12, file$3, 67, 10, 1951);
    			attr_dev(div13, "class", "popUpValue");
    			add_location(div13, file$3, 68, 10, 1988);
    			add_location(td7, file$3, 66, 8, 1935);
    			add_location(tr3, file$3, 57, 6, 1646);
    			add_location(div14, file$3, 73, 10, 2100);
    			attr_dev(div15, "class", "popUpValue");
    			add_location(div15, file$3, 74, 10, 2133);
    			add_location(td8, file$3, 72, 8, 2084);
    			add_location(div16, file$3, 78, 10, 2223);
    			attr_dev(div17, "class", "popUpValue");
    			add_location(div17, file$3, 79, 10, 2259);
    			add_location(td9, file$3, 77, 8, 2207);
    			add_location(tr4, file$3, 71, 6, 2070);
    			add_location(div18, file$3, 84, 10, 2370);
    			attr_dev(div19, "class", "popUpValue");
    			add_location(div19, file$3, 85, 10, 2403);
    			add_location(td10, file$3, 83, 8, 2354);
    			add_location(div20, file$3, 89, 10, 2493);
    			attr_dev(div21, "class", "popUpValue");
    			add_location(div21, file$3, 90, 10, 2529);
    			add_location(td11, file$3, 88, 8, 2477);
    			add_location(tr5, file$3, 82, 6, 2340);
    			add_location(div22, file$3, 95, 10, 2640);
    			attr_dev(div23, "class", "popUpValue");
    			add_location(div23, file$3, 96, 10, 2674);
    			add_location(td12, file$3, 94, 8, 2624);
    			add_location(div24, file$3, 99, 10, 2763);
    			attr_dev(div25, "class", "popUpValue");
    			add_location(div25, file$3, 100, 10, 2796);
    			add_location(td13, file$3, 98, 8, 2747);
    			add_location(tr6, file$3, 93, 6, 2610);
    			add_location(div26, file$3, 105, 10, 2909);
    			attr_dev(div27, "class", "popUpValue");
    			add_location(div27, file$3, 106, 10, 2939);
    			add_location(td14, file$3, 104, 8, 2893);
    			add_location(div28, file$3, 109, 10, 3025);
    			attr_dev(div29, "class", "popUpValue");
    			add_location(div29, file$3, 110, 10, 3061);
    			add_location(td15, file$3, 108, 8, 3009);
    			add_location(tr7, file$3, 103, 6, 2879);
    			add_location(tbody, file$3, 20, 4, 614);
    			attr_dev(table, "class", "popupTable");
    			add_location(table, file$3, 19, 2, 582);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tbody);
    			append_dev(tbody, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, div0);
    			append_dev(td0, t3);
    			append_dev(td0, div1);
    			append_dev(div1, t4);
    			append_dev(tr0, t5);
    			append_dev(tr0, td1);
    			append_dev(td1, div2);
    			append_dev(td1, t7);
    			append_dev(td1, div3);
    			append_dev(div3, t8);
    			append_dev(tbody, t9);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td2);
    			append_dev(td2, div4);
    			append_dev(td2, t11);
    			append_dev(td2, div5);
    			append_dev(div5, t12);
    			append_dev(tr1, t13);
    			append_dev(tr1, td3);
    			append_dev(td3, div6);
    			append_dev(td3, t15);
    			append_dev(td3, div7);
    			append_dev(div7, t16);
    			append_dev(tbody, t17);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td4);
    			append_dev(td4, div8);
    			append_dev(td4, t19);
    			append_dev(td4, div9);
    			append_dev(div9, t20);
    			append_dev(tr2, t21);
    			append_dev(tr2, td5);
    			if_block0.m(td5, null);
    			append_dev(td5, t22);
    			append_dev(td5, div10);
    			append_dev(div10, t23);
    			append_dev(div10, t24);
    			append_dev(tbody, t25);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td6);
    			if_block1.m(td6, null);
    			append_dev(td6, t26);
    			append_dev(td6, div11);
    			append_dev(div11, t27);
    			append_dev(tr3, t28);
    			append_dev(tr3, td7);
    			append_dev(td7, div12);
    			append_dev(td7, t30);
    			append_dev(td7, div13);
    			append_dev(div13, t31);
    			append_dev(tbody, t32);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td8);
    			append_dev(td8, div14);
    			append_dev(td8, t34);
    			append_dev(td8, div15);
    			append_dev(div15, t35);
    			append_dev(tr4, t36);
    			append_dev(tr4, td9);
    			append_dev(td9, div16);
    			append_dev(td9, t38);
    			append_dev(td9, div17);
    			append_dev(div17, t39);
    			append_dev(tbody, t40);
    			append_dev(tbody, tr5);
    			append_dev(tr5, td10);
    			append_dev(td10, div18);
    			append_dev(td10, t42);
    			append_dev(td10, div19);
    			append_dev(div19, t43);
    			append_dev(tr5, t44);
    			append_dev(tr5, td11);
    			append_dev(td11, div20);
    			append_dev(td11, t46);
    			append_dev(td11, div21);
    			append_dev(div21, t47);
    			append_dev(tbody, t48);
    			append_dev(tbody, tr6);
    			append_dev(tr6, td12);
    			append_dev(td12, div22);
    			append_dev(td12, t50);
    			append_dev(td12, div23);
    			append_dev(div23, t51);
    			append_dev(tr6, t52);
    			append_dev(tr6, td13);
    			append_dev(td13, div24);
    			append_dev(td13, t54);
    			append_dev(td13, div25);
    			append_dev(div25, t55);
    			append_dev(tbody, t56);
    			append_dev(tbody, tr7);
    			append_dev(tr7, td14);
    			append_dev(td14, div26);
    			append_dev(td14, t58);
    			append_dev(td14, div27);
    			append_dev(div27, t59);
    			append_dev(tr7, t60);
    			append_dev(tr7, td15);
    			append_dev(td15, div28);
    			append_dev(td15, t62);
    			append_dev(td15, div29);
    			append_dev(div29, t63);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*close*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*moneda*/ 2 && t4_value !== (t4_value = /*moneda*/ ctx[1].symbol + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*moneda*/ 2 && t8_value !== (t8_value = /*moneda*/ ctx[1].lastPrice + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*moneda*/ 2 && t12_value !== (t12_value = /*moneda*/ ctx[1].openPrice + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*moneda*/ 2 && t16_value !== (t16_value = /*moneda*/ ctx[1].prevClosePrice + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*moneda*/ 2 && t20_value !== (t20_value = /*moneda*/ ctx[1].priceChange + "")) set_data_dev(t20, t20_value);
    			if_block0.p(ctx, dirty);
    			if (dirty & /*moneda*/ 2 && t23_value !== (t23_value = parseFloat(/*moneda*/ ctx[1].priceChangePercent).toFixed(2) + "")) set_data_dev(t23, t23_value);
    			if_block1.p(ctx, dirty);
    			if (dirty & /*moneda*/ 2 && t27_value !== (t27_value = /*moneda*/ ctx[1].weightedAvgPrice + "")) set_data_dev(t27, t27_value);
    			if (dirty & /*moneda*/ 2 && t31_value !== (t31_value = /*moneda*/ ctx[1].lastQty + "")) set_data_dev(t31, t31_value);
    			if (dirty & /*moneda*/ 2 && t35_value !== (t35_value = /*moneda*/ ctx[1].bidPrice + "")) set_data_dev(t35, t35_value);
    			if (dirty & /*moneda*/ 2 && t39_value !== (t39_value = /*moneda*/ ctx[1].bidQty + "")) set_data_dev(t39, t39_value);
    			if (dirty & /*moneda*/ 2 && t43_value !== (t43_value = /*moneda*/ ctx[1].askPrice + "")) set_data_dev(t43, t43_value);
    			if (dirty & /*moneda*/ 2 && t47_value !== (t47_value = /*moneda*/ ctx[1].askQty + "")) set_data_dev(t47, t47_value);
    			if (dirty & /*moneda*/ 2 && t51_value !== (t51_value = /*moneda*/ ctx[1].highPrice + "")) set_data_dev(t51, t51_value);
    			if (dirty & /*moneda*/ 2 && t55_value !== (t55_value = /*moneda*/ ctx[1].lowPrice + "")) set_data_dev(t55, t55_value);
    			if (dirty & /*moneda*/ 2 && t59_value !== (t59_value = /*moneda*/ ctx[1].volume + "")) set_data_dev(t59, t59_value);
    			if (dirty & /*moneda*/ 2 && t63_value !== (t63_value = /*moneda*/ ctx[1].quoteVolume + "")) set_data_dev(t63, t63_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    			if_block0.d();
    			if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(18:0) <Popup {isOpen} on:close={close}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				isOpen: /*isOpen*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	popup.$on("close", /*close*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const popup_changes = {};
    			if (dirty & /*isOpen*/ 1) popup_changes.isOpen = /*isOpen*/ ctx[0];

    			if (dirty & /*$$scope, moneda*/ 514) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, []);
    	let percentatgePopupMobile = "Price change %: ";
    	let percentatgePopup = "Price change percent: ";
    	let weightAveragePopupMobile = "Weighted avg: ";
    	let weightAveragePopup = "Weighted average: ";
    	let desktop = 600;
    	const close = () => $$invalidate(0, isOpen = false);
    	let { isOpen = false } = $$props;
    	let { moneda = [] } = $$props;

    	function open() {
    		$$invalidate(0, isOpen = true);
    	}

    	const writable_props = ["isOpen", "moneda"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ("moneda" in $$props) $$invalidate(1, moneda = $$props.moneda);
    	};

    	$$self.$capture_state = () => ({
    		Popup,
    		percentatgePopupMobile,
    		percentatgePopup,
    		weightAveragePopupMobile,
    		weightAveragePopup,
    		desktop,
    		close,
    		isOpen,
    		moneda,
    		open
    	});

    	$$self.$inject_state = $$props => {
    		if ("percentatgePopupMobile" in $$props) $$invalidate(2, percentatgePopupMobile = $$props.percentatgePopupMobile);
    		if ("percentatgePopup" in $$props) $$invalidate(3, percentatgePopup = $$props.percentatgePopup);
    		if ("weightAveragePopupMobile" in $$props) $$invalidate(4, weightAveragePopupMobile = $$props.weightAveragePopupMobile);
    		if ("weightAveragePopup" in $$props) $$invalidate(5, weightAveragePopup = $$props.weightAveragePopup);
    		if ("desktop" in $$props) $$invalidate(6, desktop = $$props.desktop);
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ("moneda" in $$props) $$invalidate(1, moneda = $$props.moneda);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isOpen,
    		moneda,
    		percentatgePopupMobile,
    		percentatgePopup,
    		weightAveragePopupMobile,
    		weightAveragePopup,
    		desktop,
    		close,
    		open
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { isOpen: 0, moneda: 1, open: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get isOpen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get moneda() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set moneda(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		return this.$$.ctx[8];
    	}

    	set open(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Table.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\components\\Table.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (131:8) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*percentatge*/ ctx[6]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(131:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (129:8) {#if window.screen.width < desktop}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*percentatgeMobile*/ ctx[7]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(129:8) {#if window.screen.width < desktop}",
    		ctx
    	});

    	return block;
    }

    // (139:4) {#each coins as row}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[20].symbol + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = parseFloat(/*row*/ ctx[20].priceChangePercent).toFixed(2) + "";
    	let t2;
    	let td1_class_value;
    	let t3;
    	let td2;
    	let t4_value = /*row*/ ctx[20].lastPrice + "";
    	let t4;
    	let tr_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file$2, 145, 8, 4055);

    			attr_dev(td1, "class", td1_class_value = /*row*/ ctx[20].priceChangePercent >= /*limitPercentatge*/ ctx[9]
    			? "major"
    			: "menor");

    			add_location(td1, file$2, 146, 8, 4086);
    			add_location(td2, file$2, 151, 8, 4266);

    			attr_dev(tr, "class", tr_class_value = /*row*/ ctx[20].priceChangePercent >= /*limitPercentatge*/ ctx[9]
    			? "majorHover"
    			: "menorHover");

    			add_location(tr, file$2, 139, 6, 3854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);

    			if (!mounted) {
    				dispose = listen_dev(
    					tr,
    					"click",
    					prevent_default(function () {
    						if (is_function(/*changeBooleanIsOpenInModal*/ ctx[2](/*row*/ ctx[20]))) /*changeBooleanIsOpenInModal*/ ctx[2](/*row*/ ctx[20]).apply(this, arguments);
    					}),
    					false,
    					true,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*coins*/ 1 && t0_value !== (t0_value = /*row*/ ctx[20].symbol + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*coins*/ 1 && t2_value !== (t2_value = parseFloat(/*row*/ ctx[20].priceChangePercent).toFixed(2) + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*coins*/ 1 && td1_class_value !== (td1_class_value = /*row*/ ctx[20].priceChangePercent >= /*limitPercentatge*/ ctx[9]
    			? "major"
    			: "menor")) {
    				attr_dev(td1, "class", td1_class_value);
    			}

    			if (dirty & /*coins*/ 1 && t4_value !== (t4_value = /*row*/ ctx[20].lastPrice + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*coins*/ 1 && tr_class_value !== (tr_class_value = /*row*/ ctx[20].priceChangePercent >= /*limitPercentatge*/ ctx[9]
    			? "majorHover"
    			: "menorHover")) {
    				attr_dev(tr, "class", tr_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(139:4) {#each coins as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let header;
    	let t0;
    	let div0;
    	let button;
    	let fa;
    	let t1;
    	let input;
    	let t2;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t4;
    	let th1;
    	let t5;
    	let th2;
    	let t7;
    	let tbody;
    	let t8;
    	let td;
    	let t9;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;

    	header = new Header({
    			props: { title: "Coin stats" },
    			$$inline: true
    		});

    	fa = new Fa({ props: { icon: faSync }, $$inline: true });

    	function select_block_type(ctx, dirty) {
    		if (window.screen.width < /*desktop*/ ctx[8]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*coins*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	var switch_value = Modal;

    	function switch_props(ctx) {
    		let switch_instance_props = { moneda: /*moneda*/ ctx[4] };

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[15](switch_instance);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			button = element("button");
    			create_component(fa.$$.fragment);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t4 = space();
    			th1 = element("th");
    			if_block.c();
    			t5 = space();
    			th2 = element("th");
    			th2.textContent = "Last price";
    			t7 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			td = element("td");
    			t9 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			add_location(button, file$2, 110, 4, 3098);
    			attr_dev(input, "class", "cercador");
    			attr_dev(input, "placeholder", "Search...");
    			add_location(input, file$2, 111, 4, 3162);
    			attr_dev(div0, "class", "cercar");
    			add_location(div0, file$2, 109, 2, 3072);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$2, 107, 0, 3012);
    			attr_dev(th0, "class", "nom-th");
    			add_location(th0, file$2, 123, 6, 3387);
    			attr_dev(th1, "class", "percent-th");
    			add_location(th1, file$2, 124, 6, 3449);
    			attr_dev(th2, "class", "preu-th");
    			add_location(th2, file$2, 134, 6, 3722);
    			add_location(tr, file$2, 122, 4, 3375);
    			add_location(thead, file$2, 121, 2, 3362);
    			add_location(td, file$2, 154, 4, 4322);
    			add_location(tbody, file$2, 137, 2, 3813);
    			attr_dev(table, "class", "taulaPrincipal");
    			add_location(table, file$2, 120, 0, 3328);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(header, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			mount_component(fa, button, null);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t4);
    			append_dev(tr, th1);
    			if_block.m(th1, null);
    			append_dev(tr, t5);
    			append_dev(tr, th2);
    			append_dev(table, t7);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t8);
    			append_dev(tbody, td);
    			append_dev(table, t9);

    			if (switch_instance) {
    				mount_component(switch_instance, table, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*refrescar*/ ctx[10], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[14], false, false, false),
    					listen_dev(
    						th0,
    						"click",
    						function () {
    							if (is_function(/*sort*/ ctx[1]("symbol"))) /*sort*/ ctx[1]("symbol").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						th1,
    						"click",
    						function () {
    							if (is_function((/*sort*/ ctx[1]("priceChangePercent"), /*ordrePerpercentatge*/ ctx[5] = true))) (/*sort*/ ctx[1]("priceChangePercent"), /*ordrePerpercentatge*/ ctx[5] = true).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						th2,
    						"click",
    						function () {
    							if (is_function(/*sort*/ ctx[1]("lastPrice"))) /*sort*/ ctx[1]("lastPrice").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if_block.p(ctx, dirty);

    			if (dirty & /*coins, limitPercentatge, changeBooleanIsOpenInModal, parseFloat*/ 517) {
    				each_value = /*coins*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t8);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const switch_instance_changes = {};
    			if (dirty & /*moneda*/ 16) switch_instance_changes.moneda = /*moneda*/ ctx[4];

    			if (switch_value !== (switch_value = Modal)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[15](switch_instance);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, table, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(fa.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(fa.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(header);
    			destroy_component(fa);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(table);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			/*switch_instance_binding*/ ctx[15](null);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let sort;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Table", slots, []);
    	let coins;
    	let modificadorOrdre;
    	let ordrePer;
    	let ordrePerpercentatge = false;
    	let posts = [];
    	let response;
    	let percentatge = "Price change percent";
    	let percentatgeMobile = "24h %";
    	let changeBooleanIsOpenInModal;
    	let modalComponent;
    	let desktop = 600;
    	let limitPercentatge = 0;
    	let timer;
    	let moneda = [];

    	//Subscripció a l'store.
    	const unsubscribe = coinStore.subscribe(value => {
    		$$invalidate(0, coins = value);
    	});

    	//Càrrega de dades en iniciar.
    	onMount(async () => {
    		response = await fetch(url);
    		posts = await response.json();
    		coinStore.set(posts);
    	});

    	//Modal
    	changeBooleanIsOpenInModal = function (value) {
    		$$invalidate(4, moneda = value);
    		modalComponent.open();
    	};

    	//Inicialitzador de l'ordre de la columna.
    	ordrePer = {
    		defecte: "priceChangePercent",
    		ascending: true
    	};

    	//Funció per a refrescar la taula
    	async function refrescar() {
    		response = await fetch(url);
    		posts = await response.json();
    		coinStore.set(posts);
    	}

    	//Funció per a fer la cerca.
    	async function cercar(valorACercar) {
    		coinStore.update(valor => {
    			$$invalidate(0, coins = valor);
    			return coins;
    		});

    		clearTimeout(timer);

    		timer = setTimeout(
    			() => {
    				$$invalidate(0, coins = coins.filter(element => element.symbol.includes(valorACercar.toUpperCase())));
    			},
    			750
    		);
    	}

    	//Cancel·lar subscripció al tancar.
    	onDestroy(unsubscribe);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	const keyup_handler = ({ target: { value } }) => cercar(value);

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modalComponent = $$value;
    			$$invalidate(3, modalComponent);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Fa,
    		faSync,
    		onDestroy,
    		coinStore,
    		url,
    		Header,
    		Modal,
    		coins,
    		modificadorOrdre,
    		ordrePer,
    		ordrePerpercentatge,
    		posts,
    		response,
    		percentatge,
    		percentatgeMobile,
    		changeBooleanIsOpenInModal,
    		modalComponent,
    		desktop,
    		limitPercentatge,
    		timer,
    		moneda,
    		unsubscribe,
    		refrescar,
    		cercar,
    		sort
    	});

    	$$self.$inject_state = $$props => {
    		if ("coins" in $$props) $$invalidate(0, coins = $$props.coins);
    		if ("modificadorOrdre" in $$props) $$invalidate(12, modificadorOrdre = $$props.modificadorOrdre);
    		if ("ordrePer" in $$props) $$invalidate(13, ordrePer = $$props.ordrePer);
    		if ("ordrePerpercentatge" in $$props) $$invalidate(5, ordrePerpercentatge = $$props.ordrePerpercentatge);
    		if ("posts" in $$props) posts = $$props.posts;
    		if ("response" in $$props) response = $$props.response;
    		if ("percentatge" in $$props) $$invalidate(6, percentatge = $$props.percentatge);
    		if ("percentatgeMobile" in $$props) $$invalidate(7, percentatgeMobile = $$props.percentatgeMobile);
    		if ("changeBooleanIsOpenInModal" in $$props) $$invalidate(2, changeBooleanIsOpenInModal = $$props.changeBooleanIsOpenInModal);
    		if ("modalComponent" in $$props) $$invalidate(3, modalComponent = $$props.modalComponent);
    		if ("desktop" in $$props) $$invalidate(8, desktop = $$props.desktop);
    		if ("limitPercentatge" in $$props) $$invalidate(9, limitPercentatge = $$props.limitPercentatge);
    		if ("timer" in $$props) timer = $$props.timer;
    		if ("moneda" in $$props) $$invalidate(4, moneda = $$props.moneda);
    		if ("sort" in $$props) $$invalidate(1, sort = $$props.sort);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ordrePer, modificadorOrdre, coins, sort*/ 12291) {
    			//Ascendent o descendent.
    			$$invalidate(1, sort = columna => {
    				if (ordrePer.defecte == columna) {
    					$$invalidate(13, ordrePer.ascending = !ordrePer.ascending, ordrePer);
    				} else {
    					$$invalidate(13, ordrePer.defecte = columna, ordrePer);
    					$$invalidate(13, ordrePer.ascending = true, ordrePer);
    				}

    				// Modificació de l'ordre de la columna, ascendent o descendent.
    				$$invalidate(12, modificadorOrdre = ordrePer.ascending ? 1 : -1);

    				if (columna === "symbol") {
    					$$invalidate(1, sort = (a, b) => a[columna] < b[columna]
    					? -1 * modificadorOrdre
    					: a[columna] > b[columna]
    						? 1 * modificadorOrdre
    						: a[columna] < b[columna]);
    				} else if (columna === "priceChangePercent") {
    					$$invalidate(1, sort = (a, b) => Number(a[columna]) < Number(b[columna])
    					? -1 * modificadorOrdre
    					: Number(a[columna]) > Number(b[columna])
    						? 1 * modificadorOrdre
    						: 0);
    				} else {
    					$$invalidate(1, sort = (a, b) => Number(a[columna]) < Number(b[columna])
    					? -1 * modificadorOrdre
    					: Number(a[columna]) > Number(b[columna])
    						? 1 * modificadorOrdre
    						: 0);
    				}

    				$$invalidate(0, coins = coins.sort(sort));
    			});
    		}
    	};

    	return [
    		coins,
    		sort,
    		changeBooleanIsOpenInModal,
    		modalComponent,
    		moneda,
    		ordrePerpercentatge,
    		percentatge,
    		percentatgeMobile,
    		desktop,
    		limitPercentatge,
    		refrescar,
    		cercar,
    		modificadorOrdre,
    		ordrePer,
    		keyup_handler,
    		switch_instance_binding
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\components\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			a = element("a");
    			a.textContent = "Jordi Gómez Lozano - 2021";
    			attr_dev(a, "class", "footer-text");
    			attr_dev(a, "href", "https://www.twitter.com/realGoloSEO");
    			add_location(a, file$1, 6, 4, 83);
    			add_location(div, file$1, 5, 2, 72);
    			add_location(footer, file$1, 4, 0, 60);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let table;
    	let t;
    	let footer;
    	let current;
    	table = new Table({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(table.$$.fragment);
    			t = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1c74muz");
    			add_location(main, file, 5, 0, 125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(table, main, null);
    			append_dev(main, t);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(table);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Table, Footer });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
