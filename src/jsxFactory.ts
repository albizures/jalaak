import { Val } from './val';

export type Attrs<Map, T extends keyof Map> = Partial<Map[T]>;

type Booleanish = boolean | 'true' | 'false';

type AComponent<P extends {}> = (props: P) => AElement;
interface AElement<P = unknown, T extends AComponent<any> | string = AComponent<any> | string> {
	type: T;
	props: P & { children: AChildren };
}

type Primitive = string | number;
type ValPrimitive = DistributeVal<Primitive>;

type AChild = Primitive | AElement | Iterable<AElement> | undefined | ValPrimitive;
type AChildren = AChild[];

declare global {
	namespace JSX {
		type HTMLMap = HTMLElementTagNameMap;
		type HTMLElements = keyof HTMLMap;
		type SVGMap = SVGElementTagNameMap;
		type SVGElements = keyof SVGMap;
		type Element = AElement;
		type Child = AChild;
		type Children = AChildren;
		type Node = Child[] | Child;

		type InputEvent = EventWithTarget<Event, HTMLInputElement>;

		interface ElementAttributesProperty {
			props: {};
		}
		interface ElementChildrenAttribute {
			children: {};
		}

		type Component<P extends {}> = AComponent<P>;
		type PropsAndChildren<P> = P & { children: AChildren };

		type IntrinsicElements = {
			[T in keyof Omit<HTMLMap, 'input' | 'a'>]: Partial<
				Omit<Omit<HTMLMap, 'input' | 'a'>[T], 'children'>
			> & {
				children?: Node;
			};
		} & {
			input: InputHTMLAttributes;
			a: AnchorHTMLAttributes;
		};
		type ElementNames = keyof IntrinsicElements;
	}
}

type EventHandler<E extends Event> = (event: E) => void;
type EventWithTarget<E extends Event, T extends HTMLElement> = E & { target: T };

interface CustomAttributes<T extends HTMLElement> {
	children?: Node;

	oninput?: EventHandler<EventWithTarget<Event, T>>;
	onclick?: EventHandler<EventWithTarget<Event, T>>;
}

type HTMLAttributeReferrerPolicy =
	| ''
	| 'no-referrer'
	| 'no-referrer-when-downgrade'
	| 'origin'
	| 'origin-when-cross-origin'
	| 'same-origin'
	| 'strict-origin'
	| 'strict-origin-when-cross-origin'
	| 'unsafe-url';

type HTMLAttributeAnchorTarget = '_self' | '_blank' | '_parent' | '_top';

interface AnchorHTMLAttributes extends HTMLAttributes<HTMLAnchorElement> {
	download?: any;
	href?: string | undefined;
	hrefLang?: string | undefined;
	media?: string | undefined;
	ping?: string | undefined;
	rel?: string | undefined;
	target?: HTMLAttributeAnchorTarget | undefined;
	type?: string | undefined;
	referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
}

type Attr<K extends keyof HTMLElement, V = HTMLElement[K]> = V | Val<V>;

type DistributeVal<U> = U extends any ? Val<U> : never;

type InputAttr<K extends keyof HTMLInputElement, V = HTMLInputElement[K]> = V | DistributeVal<V>;

interface InputHTMLAttributes extends HTMLAttributes<HTMLInputElement> {
	placeholder?: InputAttr<'placeholder'>;
	value: InputAttr<'value', string | number>;
}

interface HTMLAttributes<T extends HTMLElement> extends AriaAttributes, CustomAttributes<T> {
	// Standard HTML Attributes
	accessKey?: Attr<'accessKey'>;
	className?: Attr<'className'>;
	classList?: Attr<'classList'>;
	contentEditable?: Attr<'contentEditable', Booleanish | 'inherit'>;
	dir?: Attr<'dir'>;
	draggable?: Attr<'draggable', Booleanish>;
	hidden?: Attr<'hidden', boolean>;
	id?: Attr<'id'>;
	lang?: Attr<'lang'>;
	nonce?: Attr<'nonce'>;
	slot?: Attr<'slot'>;
	spellcheck?: Attr<'spellcheck', Booleanish>;
	style?: Attr<'style'>;
	tabIndex?: Attr<'tabIndex'>;
	title?: Attr<'title'>;
	translate?: Attr<'translate', 'yes' | 'no'>;
	prefix?: Attr<'prefix', string>;

	// WAI-ARIA
	role?: Attr<'role', AriaRole>;
}

// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
interface AriaAttributes {
	/** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
	'aria-activedescendant'?: string;
	/** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
	ariaAtomic?: Attr<'ariaAtomic', Booleanish>;
	/**
	 * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
	 * presented if they are made.
	 */
	ariaAutoComplete?: Attr<'ariaAutoComplete', 'none' | 'inline' | 'list' | 'both'>;
	/** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
	ariaBusy?: Attr<'ariaBusy', Booleanish>;
	/**
	 * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
	 * @see aria-pressed @see aria-selected.
	 */
	ariaChecked?: Attr<'ariaChecked', Booleanish | 'mixed'>;
	/**
	 * Defines the total number of columns in a table, grid, or treegrid.
	 * @see aria-colindex.
	 */
	ariaColCount?: Attr<'ariaColCount', number>;
	/**
	 * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
	 * @see aria-colcount @see aria-colspan.
	 */
	ariaColIndex?: Attr<'ariaColIndex', number>;

	/**
	 * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
	 * @see aria-colindex @see aria-rowspan.
	 */
	ariaColSpan?: Attr<'ariaColSpan', number>;
	/**
	 * Identifies the element (or elements) whose contents or presence are controlled by the current element.
	 * @see aria-owns.
	 */
	'aria-controls'?: string;
	/** Indicates the element that represents the current item within a container or set of related elements. */
	ariaCurrent?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
	/**
	 * Identifies the element (or elements) that describes the object.
	 * @see aria-labelledby
	 */
	'aria-describedby'?: string;
	/**
	 * Identifies the element that provides a detailed, extended description for the object.
	 * @see aria-describedby.
	 */
	'aria-details'?: string;
	/**
	 * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
	 * @see aria-hidden @see aria-readonly.
	 */
	'aria-disabled'?: Booleanish;
	/**
	 * Indicates what functions can be performed when a dragged object is released on the drop target.
	 * @deprecated in ARIA 1.1
	 */
	'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
	/**
	 * Identifies the element that provides an error message for the object.
	 * @see aria-invalid @see aria-describedby.
	 */
	'aria-errormessage'?: string;
	/** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
	'aria-expanded'?: Booleanish;
	/**
	 * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
	 * allows assistive technology to override the general default of reading in document source order.
	 */
	'aria-flowto'?: string;
	/**
	 * Indicates an element's "grabbed" state in a drag-and-drop operation.
	 * @deprecated in ARIA 1.1
	 */
	'aria-grabbed'?: Booleanish;
	/** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
	'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
	/**
	 * Indicates whether the element is exposed to an accessibility API.
	 * @see aria-disabled.
	 */
	'aria-hidden'?: Booleanish;
	/**
	 * Indicates the entered value does not conform to the format expected by the application.
	 * @see aria-errormessage.
	 */
	'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
	/** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
	'aria-keyshortcuts'?: string;
	/**
	 * Defines a string value that labels the current element.
	 * @see aria-labelledby.
	 */
	'aria-label'?: string;
	/**
	 * Identifies the element (or elements) that labels the current element.
	 * @see aria-describedby.
	 */
	'aria-labelledby'?: string;
	/** Defines the hierarchical level of an element within a structure. */
	'aria-level'?: number;
	/** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
	'aria-live'?: 'off' | 'assertive' | 'polite';
	/** Indicates whether an element is modal when displayed. */
	'aria-modal'?: Booleanish;
	/** Indicates whether a text box accepts multiple lines of input or only a single line. */
	'aria-multiline'?: Booleanish;
	/** Indicates that the user may select more than one item from the current selectable descendants. */
	'aria-multiselectable'?: Booleanish;
	/** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
	'aria-orientation'?: 'horizontal' | 'vertical';
	/**
	 * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
	 * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
	 * @see aria-controls.
	 */
	'aria-owns'?: string;
	/**
	 * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
	 * A hint could be a sample value or a brief description of the expected format.
	 */
	'aria-placeholder'?: string;
	/**
	 * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
	 * @see aria-setsize.
	 */
	'aria-posinset'?: number;
	/**
	 * Indicates the current "pressed" state of toggle buttons.
	 * @see aria-checked @see aria-selected.
	 */
	'aria-pressed'?: boolean | 'false' | 'mixed' | 'true';
	/**
	 * Indicates that the element is not editable, but is otherwise operable.
	 * @see aria-disabled.
	 */
	'aria-readonly'?: Booleanish;
	/**
	 * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
	 * @see aria-atomic.
	 */
	'aria-relevant'?:
		| 'additions'
		| 'additions removals'
		| 'additions text'
		| 'all'
		| 'removals'
		| 'removals additions'
		| 'removals text'
		| 'text'
		| 'text additions'
		| 'text removals';
	/** Indicates that user input is required on the element before a form may be submitted. */
	'aria-required'?: Booleanish;
	/** Defines a human-readable, author-localized description for the role of an element. */
	'aria-roledescription'?: string;
	/**
	 * Defines the total number of rows in a table, grid, or treegrid.
	 * @see aria-rowindex.
	 */
	'aria-rowcount'?: number;
	/**
	 * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
	 * @see aria-rowcount @see aria-rowspan.
	 */
	'aria-rowindex'?: number;
	/**
	 * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
	 * @see aria-rowindex @see aria-colspan.
	 */
	'aria-rowspan'?: number;
	/**
	 * Indicates the current "selected" state of various widgets.
	 * @see aria-checked @see aria-pressed.
	 */
	'aria-selected'?: Booleanish;
	/**
	 * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
	 * @see aria-posinset.
	 */
	'aria-setsize'?: number;
	/** Indicates if items in a table or grid are sorted in ascending or descending order. */
	'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
	/** Defines the maximum allowed value for a range widget. */
	'aria-valuemax'?: number;
	/** Defines the minimum allowed value for a range widget. */
	'aria-valuemin'?: number;
	/**
	 * Defines the current value for a range widget.
	 * @see aria-valuetext.
	 */
	'aria-valuenow'?: number;
	/** Defines the human readable text alternative of aria-valuenow for a range widget. */
	'aria-valuetext'?: string;
}

// All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
type AriaRole =
	| 'alert'
	| 'alertdialog'
	| 'application'
	| 'article'
	| 'banner'
	| 'button'
	| 'cell'
	| 'checkbox'
	| 'columnheader'
	| 'combobox'
	| 'complementary'
	| 'contentinfo'
	| 'definition'
	| 'dialog'
	| 'directory'
	| 'document'
	| 'feed'
	| 'figure'
	| 'form'
	| 'grid'
	| 'gridcell'
	| 'group'
	| 'heading'
	| 'img'
	| 'link'
	| 'list'
	| 'listbox'
	| 'listitem'
	| 'log'
	| 'main'
	| 'marquee'
	| 'math'
	| 'menu'
	| 'menubar'
	| 'menuitem'
	| 'menuitemcheckbox'
	| 'menuitemradio'
	| 'navigation'
	| 'none'
	| 'note'
	| 'option'
	| 'presentation'
	| 'progressbar'
	| 'radio'
	| 'radiogroup'
	| 'region'
	| 'row'
	| 'rowgroup'
	| 'rowheader'
	| 'scrollbar'
	| 'search'
	| 'searchbox'
	| 'separator'
	| 'slider'
	| 'spinbutton'
	| 'status'
	| 'switch'
	| 'tab'
	| 'table'
	| 'tablist'
	| 'tabpanel'
	| 'term'
	| 'textbox'
	| 'timer'
	| 'toolbar'
	| 'tooltip'
	| 'tree'
	| 'treegrid'
	| 'treeitem'
	| (string & {});
