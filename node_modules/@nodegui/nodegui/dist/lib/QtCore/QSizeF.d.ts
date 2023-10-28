import { NativeElement, Component } from '../core/Component';
import { AspectRatioMode } from '../QtEnums';
import { QSize } from './QSize';
import { QVariant } from './QVariant';
export declare class QSizeF extends Component {
    constructor(nativeOrWidth?: number | NativeElement, height?: number);
    boundedTo(otherSize: QSizeF): QSizeF;
    expandedTo(otherSize: QSizeF): QSizeF;
    height(): number;
    isEmpty(): boolean;
    isNull(): boolean;
    isValid(): boolean;
    scale(width: number, height: number, mode: AspectRatioMode): void;
    scaled(width: number, height: number, mode: AspectRatioMode): QSizeF;
    setHeight(height: number): void;
    setWidth(width: number): void;
    toSize(): QSize;
    transpose(): void;
    transposed(): QSizeF;
    width(): number;
    static fromQVariant(variant: QVariant): QSizeF;
}
