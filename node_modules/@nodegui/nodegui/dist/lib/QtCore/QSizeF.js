"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QSizeF = void 0;
const Component_1 = require("../core/Component");
const addon_1 = __importDefault(require("../utils/addon"));
const helpers_1 = require("../utils/helpers");
const QSize_1 = require("./QSize");
class QSizeF extends Component_1.Component {
    constructor(nativeOrWidth, height) {
        let native;
        if (!nativeOrWidth) {
            native = new addon_1.default.QSizeF();
        }
        else if (helpers_1.checkIfNativeElement(nativeOrWidth)) {
            native = nativeOrWidth;
        }
        else {
            native = new addon_1.default.QSizeF(nativeOrWidth, height);
        }
        super(native);
    }
    boundedTo(otherSize) {
        return new QSizeF(this.native.boundedTo(otherSize));
    }
    expandedTo(otherSize) {
        return new QSizeF(this.native.expandedTo(otherSize));
    }
    height() {
        return this.native.height();
    }
    isEmpty() {
        return this.native.isEmpty();
    }
    isNull() {
        return this.native.isNull();
    }
    isValid() {
        return this.native.isValid();
    }
    scale(width, height, mode) {
        this.native.scale(width, height, mode);
    }
    scaled(width, height, mode) {
        return new QSizeF(this.native.scaled(width, height, mode));
    }
    setHeight(height) {
        return this.native.setHeight(height);
    }
    setWidth(width) {
        return this.native.setWidth(width);
    }
    toSize() {
        return new QSize_1.QSize(this.native.toSize());
    }
    transpose() {
        this.native.transpose();
    }
    transposed() {
        return new QSizeF(this.native.transposed());
    }
    width() {
        return this.native.width();
    }
    static fromQVariant(variant) {
        return new QSizeF(addon_1.default.QSizeF.fromQVariant(variant.native));
    }
}
exports.QSizeF = QSizeF;
