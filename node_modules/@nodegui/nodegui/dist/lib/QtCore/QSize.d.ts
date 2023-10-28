import { NativeElement, Component } from '../core/Component';
import { AspectRatioMode } from '../QtEnums';
import { QVariant } from './QVariant';
export declare class QSize extends Component {
    constructor(nativeElement: NativeElement);
    constructor(width?: number, height?: number);
    boundedTo(otherSize: QSize): QSize;
    expandedTo(otherSize: QSize): QSize;
    height(): number;
    isEmpty(): boolean;
    isNull(): boolean;
    isValid(): boolean;
    scale(width: number, height: number, mode: AspectRatioMode): void;
    scaled(width: number, height: number, mode: AspectRatioMode): QSize;
    setHeight(height: number): void;
    setWidth(width: number): void;
    transpose(): void;
    transposed(): QSize;
    width(): number;
    static fromQVariant(variant: QVariant): QSize;
}
