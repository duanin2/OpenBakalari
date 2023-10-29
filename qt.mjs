import { QLayout } from '@nodegui/nodegui';

class orderedObject {
		#object = {};
		#order = [];

		constructor(initialOrder = null, initialObject = null) {
				if (initialOrder != null) {
						this.#order = initialOrder;
				}
				if (initialObject != null) {
						this.#object = initialObject;
				}
		}

		add(name, value) {
				for (const orderName of this.#order) {
						if (orderName === name) {
								throw new Error(`${name} already exists.`);
						}
				}
				this.#object[name] = value;
				this.#order.push(name);
		}
		remove(name) {
				let index = this.getIndexOf(name);

				this.#object[name] = null;
				for (let i = index + 1; i < this.#order.length; i++) {
						this.#order[i - 1] = this.#order[i];
				}
				this.#order.pop();
		}
		replace(name, value) {
				this.#object[name] = value;
		}

		swap(name1, name2) {
				let index1 = this.getIndexOf(name1);
				let index2 = this.getIndexOf(name2);

				this.#order[index1] == name2;
				this.#order[index2] == name1;
		}
		shiftUp(name1) {
				let index1 = this.getIndexOf(name1);
				
				if (index == this.#order.length) {
						return;
				}

				let index2 = index1++;
				let name2 = this.#order[index2];

				this.#order[index1] == name2;
				this.#order[index2] == name1;
		}
		shiftDown(name1) {
				let index1 = this.getIndexOf(name1);
				
				if (index == this.#order.length) {
						return;
				}

				let index2 = index1--;
				let name2 = this.#order[index2];

				this.#order[index1] == name2;
				this.#order[index2] == name1;
		}

		get object() {
				return this.#object;
		}
		get order() {
				return this.#order;
		}
		get value() {
				let ordered = [];

				for (const name in object) {
						for (let i = 0; i < order.length; i++) {
								if (order[i] == name) {
										ordered[i] = object[name];
										break;
								}
						}
				}

				return ordered;
		}

		valueAtIndex(index) {
				let name = this.#order[index];
				return this.#object[name];
		}
		valueOfName(name) {
				return this.#object[name];
		}
		getIndexOf(name) {
				for (let i = 0; i < this.#order.length; i++) {
						if (this.#order[i] == name) {
								return i;
						}
				}

				throw new Error(`Value ${name} doesn't exist.`);
		}

		valueOf() {
				return this.value;
		}

		toString() {
				return this.value.toString();
		}
}

class OrderedLayout extends OrderedObject {
		#layout;
		constructor(initialOrder = null, initialWidgets = null, layout) {
				if !(new layout() instanceof QLayout) {
						throw new TypeError("Expected QLayout.");
				}
				
				super(initialOrder, initialWidgets);

				this.#layout = layout;
				this.#reorder();
		}

		#reorder() {
				for (const widget of this.#layout.children()) {
						this.#layout.removeWidget(widget);
				}
				for (const widget of super.value) {
						this.#layout.addWidget(widget);
				}
		}

		add(name, value) {
				super.add(name, value);
				this.#layout.addWidget(value);
		}
		remove(name) {
				this.layout.removeWidget(super.valueOfName(name));
				super.remove(name);
		}
		replace(name, value) {
				super.replace(name, value);

				this.#reorder();
		}

		swap(name1, name2) {
				super.swap(name1, name2);
				this.#reorder();
		}
		shiftUp(name1) {
				super.shiftUp(name1);
				this.#reorder();
		}
		shiftDown(name1) {
				super.shiftDown(name1);
				this.#reorder();
		}

		get value() {
				return this.#layout;
		}
}

export { OrderedObject, OrderedLayout };
