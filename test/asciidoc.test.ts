'use strict';

const mockCssModules = require('mock-css-modules');
mockCssModules.register(['.style', '.css']);

require('browser-env')();
require('./helpers/MutationObserver')(global);
require('./helpers/getSelection')(global);

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
// import * as sinon from 'sinon';
import {Fixture} from 'util.fixture';
import {join} from 'util.join';
import {cleanup} from './helpers';

const debug = require('debug')('asciidoc.test');
const data = fs.readFileSync(join(__dirname, 'fixtures', 'empty-html', 'index.html')).toString('utf8');

(global as any).Quill = require('quill');

// can't use this before the global require and jsdom initialization
import {Quill} from '../lib/helpers';
let quill: any = null;

import {Markup, MarkupMode} from '../index';

test.after.always.cb(t => {
	cleanup(path.basename(__filename), t);
});

test.beforeEach(t => {
	document.body.innerHTML = data;
	quill = new Quill('#editor', {
		theme: 'snow'
	});

	t.truthy(quill);
});

test('Create Markup instance with Asciidoc mode', t => {
	const fixture = new Fixture('asciidoc');
	t.truthy(fixture);

	const txt = fixture.read('file.txt');
	t.truthy(txt);

	const markup = new Markup(quill, {
		content: txt,
		mode: MarkupMode.asciidoc
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.refresh();

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});

test('Use markup set call to change the mode to asciidoc', t => {
	const markup = new Markup(quill);

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.set({
		content: 'test',
		custom: {
			background: 'red',
			foreground: 'yellow'
		},
		fontName: 'Consolas',
		fontSize: 14,
		mode: MarkupMode.asciidoc
	});

	t.truthy(markup.opts);
	t.snapshot(markup.opts);
});

test('Use markup bold call with Asciidoc', t => {
	const markup = new Markup(quill, {
		content: 'test',
		mode: MarkupMode.asciidoc
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.setBold();

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});

for (const level of ['0', '1', '2', '3', '4', '5', '6']) {
	test(`Use markup header ${level} call with Asciidoc`, t => {
		const markup = new Markup(quill, {content: 'test', mode: MarkupMode.asciidoc});

		t.truthy(markup);
		t.truthy(markup.quill);
		t.truthy(markup.editor);

		markup.setHeader(level);

		const delta = markup.quill.getContents();
		t.truthy(delta);
		t.snapshot(delta);
	});
}
