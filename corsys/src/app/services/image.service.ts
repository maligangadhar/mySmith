import { Injectable, } from '@angular/core';
import { IPosition, IMaxPosition, IFinding, IRePosition, IEffectSetting, IRuler } from '../models/viewModels';
import { IImageService } from '../interfaces/interfaces';
import { SelectItem } from 'primeng/primeng';
import { imageConfig } from '../models/enums';


@Injectable()
export class ImageService implements IImageService {
    appLyColorPresets: (picPos: IPosition, colorPreset: string, context: any, width: number, height: number, reader, options) => void;
    colorPresetList: SelectItem[];
    zoom: (contxt, reader, options, overlays, picPos, direction, findings: IFinding[], rulers: IRuler[], maxPosition, rePosition: IRePosition, imageDimennsions: IPosition) => void;
    rotate: (contxt, reader, options, overlays, picPos, direction) => void;
    overLay: (contxt, reader, options, overlays, picPos) => void;
    negative: (context, width, height, picPos: IPosition) => void;
    sharpen: (context, weight, height, mix, picPos: IPosition) => void;
    resizeTo: (context, options, reader, overlays, picPos, value, screenWidth, screenHeight) => void;
    applyTransform: (context, reader, options, overlays, picPos, applyEffects: boolean, movetoMousePos?: boolean) => void;
    brightnessContrast: (picPos: IPosition, context, width, height, reader, options) => void;
    transformImage: (picPos: IPosition, context, width, height, reader, options) => void;
    processBrightnessContrast: (picPos: IPosition, context, brightness: IEffectSetting, contrast: IEffectSetting, width, height, reader, options) => void;
    loadLuts: () => void;
    adjustMovement: (context, reader, options, overlays, picPos, maxPosition, dragStart, offsetX, offsetY, marks, rulers: IRuler[], imageDimennsions: IPosition) => IPosition;
    zoomRulers: (reader, imageDimennsions, options, oldZoom, rulers, picPos) => void;
    zoomMarks: (reader, imageDimennsions, options, oldZoom, findings, picPos) => void;

    adjustMarksAndRulers: (marks: IFinding[], rulers: IRuler[], x: number, y: number) => void;
    createPixcelMap: (image: string) => void;
    resetDetails: () => void;
    defaultLut: number[] = [];
    currentLut: number[] = [];
    lutLuminance: number[] = [];
    currentLutLuminance: number[] = [];
    originalImageData: number[] = [];
    luts = [];
    currentContrast: number = 50;
    currentBrightness: number = 50;
    colorPreset: boolean;
    movetoMousePos: boolean;
    applyZoom: boolean = false;
    doTransform :boolean;
    private clearPresets() {
        this.movetoMousePos = false;
        this.defaultLut = [];
        this.currentLut = [];
        this.lutLuminance = [];
        this.currentLutLuminance = [];
        this.originalImageData = [];
        this.luts = [];
        this.currentContrast = 50;
        this.currentBrightness = 50;
        this.colorPreset = false;
    }
    constructor() {
        var vm = this;

        vm.colorPresetList = [
            { value: { name: 'Nrby', content: document.location.origin + '/assets/images/luts/nrby.png' }, label: 'Nrby' }
        ];

        vm.resetDetails = () => {
            vm.originalImageData.length = 0;
        };

        vm.createPixcelMap = (image: string) => {
            var pixcelLookup: any[] = [];
            if (pixcelLookup.length === 0) {

                var img = new Image();
                img.onload = function () {
                    var canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                    var imageData = canvas.getContext('2d').getImageData(0, 0, img.width, img.height);
                    var pixels = imageData.data;
                    var pixelLength = pixels.length;
                    var counter = 0;
                    for (var i = 0; i < pixelLength; i += 4) {
                        // tslint:disable-next-line:binary-expression-operand-order
                        pixcelLookup[counter++] = (0xFF000000 | ((pixels[i]) << 16) | ((pixels[i + 1]) << 8) | pixels[i + 2]);
                    }
                };
                img.src = image;
            }

            vm.luts['nrby'] = pixcelLookup;
        };
        vm.loadLuts = () => {
            this.clearPresets();
            //Default lut
            for (var x = 0; x < 65536; x++) {
                var b = x >> 8;
                // tslint:disable-next-line:binary-expression-operand-order
                vm.defaultLut.push((0xFF000000 | (b << 16) | (b << 8) | b));
                // tslint:disable-next-line:binary-expression-operand-order
                vm.currentLut.push((0xFF000000 | (b << 16) | (b << 8) | b));
                vm.lutLuminance.push(x);
                vm.currentLutLuminance.push(x);
            }

            vm.luts['Default'] = vm.defaultLut;
            vm.currentLut = vm.defaultLut;

            //Iterate through the /images/luts folder and load all available luts
            vm.createPixcelMap(document.location.origin + '/assets/images/luts/nrby.png');
        };



        vm.processBrightnessContrast = (picPos, context, brightness: IEffectSetting, contrast: IEffectSetting, width, height, reader, options) => {
            if (brightness.apply) {
                vm.currentBrightness = brightness.value + 50;
            }
            if (contrast.apply) {
                vm.currentContrast = contrast.value + 50;
            }
            if (brightness.apply || contrast.apply) {
                vm.brightnessContrast(picPos, context, width, height, reader, options);
            }
            else if (vm.colorPreset) {
                vm.transformImage(picPos, context, width, height, reader, options);
            }
        };

        vm.appLyColorPresets = (picPos, colorPreset: string, context, width: number, height: number, reader, options) => {
            vm.colorPreset = colorPreset ? true : false;
            vm.currentLut = colorPreset ? vm.luts[colorPreset] : vm.luts['Default'];
            vm.doTransform = true;
            vm.transformImage(picPos, context, width, height, reader, options);
        };

        vm.brightnessContrast = (picPos, context, width, height, reader, options) => {
            var gradient = Math.tan(Math.PI / 2.0 * (vm.currentContrast) / 100);
            var offset = vm.lutLuminance.length / 2.0 - gradient * (100 - vm.currentBrightness) * vm.lutLuminance.length / 100;
            var dXforY0 = -offset / gradient;
            var dXforYM = (vm.lutLuminance.length - 1 - offset) / gradient;
            for (var i = 0; i < vm.lutLuminance.length; i++) {
                if (i <= dXforY0) {
                    vm.currentLutLuminance[i] = vm.lutLuminance[0];
                }
                else if (i >= dXforYM) {
                    vm.currentLutLuminance[i] = vm.lutLuminance[vm.lutLuminance.length - 1];
                }
                else {
                    var grayScaleLevel = gradient * i + offset;
                    vm.currentLutLuminance[i] = grayScaleLevel >= vm.lutLuminance.length ? vm.lutLuminance[vm.lutLuminance.length - 1] :
                        vm.lutLuminance[Math.round(grayScaleLevel)];
                }
            }
            vm.transformImage(picPos, context, width, height, reader, options);
        };

        vm.transformImage = (picPos, context, width, height, reader, options) => {
            var canvas = document.createElement('canvas');
            canvas.width = reader.width;
            canvas.height = reader.height;
            var lutContext: CanvasRenderingContext2D = canvas.getContext('2d');
            //context.clearRect(0, 0, context.canvas.width, context.canvas.height);

            lutContext.drawImage(reader.img, 0, 0, reader.width, reader.height);

            var imageData = lutContext.getImageData(0, 0, reader.width, reader.height);
            var idataLength = imageData.data.length;

            if (vm.originalImageData.length <= 0 || vm.originalImageData.length !== (idataLength - 2)) {
                for (var i = 0; i < idataLength; i += 4) {
                    vm.originalImageData[i + 1] = imageData.data[i + 1];
                }
            }

            for (i = 0; i < idataLength; i += 4) {
                var k = (((vm.originalImageData[i + 1]) << 8) | (vm.originalImageData[i + 1]));
                var j = vm.currentLut[vm.currentLutLuminance[k]];
                imageData.data[i] = (j >> 16) & 0xff;
                imageData.data[i + 1] = (j >> 8) & 0xff;
                imageData.data[i + 2] = j & 0xff;
            }
            lutContext.putImageData(imageData, 0, 0, 0, 0, reader.width, reader.height);

            var imageObject = new Image();
            imageObject.onload = function () {
                if (vm.movetoMousePos) {
                    context.clearRect(picPos.x, picPos.y, context.canvas.width * options.zoom.value, context.canvas.height * options.zoom.value);
                    context.drawImage(imageObject, picPos.x, picPos.y, context.canvas.width * options.zoom.value, context.canvas.height * options.zoom.value);
                    setTimeout(() => {vm.movetoMousePos = false;},200);
                }
                else {
                    context.clearRect(0, 0, reader.width, reader.height);
                    // Save context
                    context.save();
                    var centerX = reader.width * options.zoom.value / 2;
                    var centerY = reader.height * options.zoom.value / 2;
                    // move to mouse position
                    context.translate((picPos.x + centerX), (picPos.y + centerY));
                    // Rotate canvas
                    context.rotate(options.rotate.value * Math.PI / 180);
                    // Go back
                    context.translate(- centerX, - centerY);
                    // Change scale
                    if (!options.controls.disableZoom && vm.applyZoom) {
                        context.scale(options.zoom.value, options.zoom.value);
                        vm.applyZoom = false;
                    }
                    context.drawImage(imageObject, 0, 0, reader.width, reader.height);
                }

                if(vm.doTransform){
                   vm.applyTransform(context, reader, options, null, picPos, true, true);
                    vm.doTransform = false;
                }

            };
            imageObject.src = canvas.toDataURL();
            // Clean before draw
            // context = lutContext;
        };

        vm.adjustMarksAndRulers = (marks: IFinding[], rulers: IRuler[], x: number, y: number) => {
            //console.log("is", x, y);
            if (marks) {
                for (var i = 0; i <= marks.length - 1; i++) {
                    var mark = marks[i];
                    //let diffX = (mark.boundingBox.rightBottomCoordinate.x - mark.boundingBox.leftTopCoordinate.x);
                    //let diffY = (mark.boundingBox.rightBottomCoordinate.x - mark.boundingBox.leftTopCoordinate.x);

                    mark.displayBox.leftTopCoordinate.x += x;
                    mark.displayBox.leftTopCoordinate.y += y;
                    mark.displayBox.rightBottomCoordinate.x += x;
                    mark.displayBox.rightBottomCoordinate.y += y;
                }
            }
            if (rulers) {
                for (var j = 0; j <= rulers.length - 1; j++) {
                    var ruler = rulers[j];
                    //let diffX = (mark.boundingBox.rightBottomCoordinate.x - mark.boundingBox.leftTopCoordinate.x);
                    //let diffY = (mark.boundingBox.rightBottomCoordinate.x - mark.boundingBox.leftTopCoordinate.x);

                    ruler.displayCoordinates.startPoint.x += x;
                    ruler.displayCoordinates.startPoint.y += y;
                    ruler.displayCoordinates.endPoint.x += x;
                    ruler.displayCoordinates.endPoint.y += y;
                }
            }
        };
        // tslint:disable-next-line:cyclomatic-complexity
        vm.adjustMovement = (context, reader, options, overlays, picPos, maxPosition: IMaxPosition, dragStart, offsetX, offsetY, marks, rulers: IRuler[], imageDimennsions: IPosition) => {
            let movedX: number = offsetX - dragStart.x;
            let movedY: number = offsetY - dragStart.y;
            //console.log('AM Bef ', picPos.x, movedX, dragStart.x, offsetX, maxPosition.x, maxPosition.rightX);


            let movedRight: boolean = (offsetX > dragStart.x) ? true : false;
            let movedTop: boolean = (offsetY > dragStart.y) ? true : false;
            if (movedRight) {
                if (movedX > maxPosition.x) {
                    movedX = maxPosition.x;
                }
                maxPosition.x = (maxPosition.x - movedX);
                maxPosition.rightX = (maxPosition.rightX + movedX);
            }
            else {
                let mAbs = Math.abs(movedX);
                if (mAbs > maxPosition.rightX) {
                    movedX = maxPosition.rightX * -1;
                }
                maxPosition.x = (maxPosition.x + Math.abs(movedX));
                maxPosition.rightX = (maxPosition.rightX - Math.abs(movedX));
            }
            if (movedTop) {
                if (movedY > maxPosition.y) {
                    movedY = maxPosition.y;
                }
                maxPosition.y = (maxPosition.y - movedY);
                maxPosition.rightY = (maxPosition.rightY + movedY);
            }
            else {
                let mAbs = Math.abs(movedY);

                if (mAbs > maxPosition.rightY) {
                    movedY = maxPosition.rightY * -1;
                }
                maxPosition.y = (maxPosition.y + Math.abs(movedY));
                maxPosition.rightY = (maxPosition.rightY - Math.abs(movedY));
            }


            ////movement ratio: image display width : reader or canvas width = movedX : ?
            //let actualMovedX = movedX * reader.width / imageDimennsions.x;
            //let actualMovedY = movedY * reader.height / imageDimennsions.y;
            //console.log("WH " + reader.width, reader.height, window.screen.width, window.screen.height, movedX, actualMovedX, movedY, actualMovedY, imageDimennsions.x, imageDimennsions.y);

            picPos.x = picPos.x + movedX;
            picPos.y = picPos.y + movedY;
            vm.applyTransform(context, reader, options, overlays, picPos, true, true);

            this.adjustMarksAndRulers(marks, rulers, movedX, movedY);
           // console.log('AM end ', picPos.x, movedX, dragStart.x, offsetX, maxPosition.x, maxPosition.rightX, movedRight);

            return { x: movedX, y: movedY };
        };

        vm.resizeTo = (context, reader, options, overlays, picPos, value, screenWidth, screenHeight) => {
            if ((context.canvas == null) || (reader == null)) {
                return;
            }

            // Compute page ratio
            //var options = options;
            var ratioH = context.canvas.height / reader.height;
            var ratioW = context.canvas.width / reader.width;
            // If reader render zoom itself
            // Precompute from its ratio
            if (!reader.isZoom) {
                ratioH *= options.zoom.value;
                ratioW *= options.zoom.value;
            }
            // Adjust value
            switch (value) {
                case '100%':
                    options.zoom.value = Math.max(context.canvas.height / screenHeight, context.canvas.width / screenWidth);
                    break;
                case 'width': options.zoom.value = ratioW; break;
                case 'height': options.zoom.value = ratioH; break;
                case 'page':
                default: options.zoom.value = Math.min(ratioH, ratioW);
            }
            //options.zoom.value = Math.round(options.zoom.value * 100) / 100;
            // Update options state
            options.controls.fit = value;
            if (!reader.isZoom) {
                if (reader.refresh != null) {
                    reader.refresh();
                }

                // Re center image
                this.centerPics(context, options, reader, picPos);
            } else {
                // Re center image
                this.centerPics(context, options, reader, picPos);
                this.applyTransform(context, reader, options, overlays, picPos, false);
            }
            // console.log(context.canvas.width, reader.width, screenWidth, options.zoom.value);
        };

        vm.applyTransform = (context, reader, options, overlays, picPos, applyEffects: boolean = false, movetoMousePos?: boolean) => {
            if (reader == null) {
                return;
            }
            if (!reader.rendered) {
                return;
            }

            context.canvas.height = reader.height;// * options.zoom.value;
            context.canvas.width = reader.width;// * options.zoom.value;

            this.movetoMousePos = movetoMousePos;
            if (applyEffects && (options.brightness.apply || options.contrast.apply || vm.colorPreset)) {
                this.processBrightnessContrast(picPos, context, options.brightness, options.contrast, context.canvas.width * options.zoom.value, context.canvas.height * options.zoom.value, reader, options);
            }
            else {
                if (movetoMousePos) {
                    context.clearRect(picPos.x, picPos.y, context.canvas.width * options.zoom.value, context.canvas.height * options.zoom.value);
                    context.drawImage(reader.img, picPos.x, picPos.y, context.canvas.width * options.zoom.value, context.canvas.height * options.zoom.value);
                    vm.movetoMousePos = false;

                }
                else {

                    var centerX = reader.width * options.zoom.value / 2;
                    var centerY = reader.height * options.zoom.value / 2;
                    // Clean before draw
                    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                    // Save context
                    context.save();

                    // move to mouse position
                    context.translate((picPos.x + centerX), (picPos.y + centerY));
                    // Rotate canvas
                    context.rotate(options.rotate.value * Math.PI / 180);
                    // Go back
                    context.translate(- centerX, - centerY);
                    // Change scale


                    if (!options.controls.disableZoom) {
                        context.scale(options.zoom.value, options.zoom.value);
                    }
                    if ((!options.controls.filmStrip) || (options.controls.totalPage === 1)) {
                        if (reader.img != null) {
                            context.drawImage(reader.img, 0, 0, reader.width, reader.height);
                            context.beginPath();
                            context.rect(0, 0, reader.width, reader.height);
                            context.lineWidth = 0.2;
                            context.strokeStyle = '#000000';
                            context.stroke();
                        }
                        // Draw image at correct position with correct scale
                        if (reader.data != null) {
                            context.putImageData(reader.data, picPos.x, picPos.y);
                            context.beginPath();
                            context.rect(0, 0, reader.width, reader.height);
                            context.lineWidth = 0.2;
                            context.strokeStyle = '#000000';
                            context.stroke();
                        }
                    } else {
                        if (reader.images != null) {
                            for (var i = 0; i < reader.images.length; i++) {
                                var image = reader.images[i];
                                context.drawImage(image, 0, 0, image.width, image.height);
                                context.beginPath();
                                context.rect(0, 0, image.width, image.height);
                                context.lineWidth = 0.2;
                                context.strokeStyle = '#000000';
                                context.stroke();
                                context.translate(0, image.height + 15);
                            }
                        }
                        // Draw image at correct position with correct scale
                        if (reader.data != null) {
                            var offsetY = 0;
                            for (var k = 0; k < reader.data.length; k++) {
                                var data = reader.data[k];
                                //var imagedata: ImageData = context.getImageData(0, 0, 100, 100);
                                context.putImageData(data, picPos.x, picPos.y + offsetY);
                                context.beginPath();
                                context.rect(0, 0, reader.width, reader.height);
                                context.lineWidth = 0.2;
                                context.strokeStyle = '#000000';
                                context.stroke();
                                offsetY += reader.height + 15;
                                context.translate(0, offsetY);
                            }
                        }
                    }
                    // Restore
                    // context.restore();

                }
            }
            // Draw overlays
            if (overlays && overlays.length > 0) {
                for (var j = 0; j < overlays.length; j++) {
                    var item = overlays[j];
                    context.save();
                    // move to mouse position
                    context.translate((picPos.x + centerX), (picPos.y + centerY));
                    // Rotate canvas
                    context.rotate(options.rotate.value * Math.PI / 180);
                    // Go back
                    context.translate(- centerX, - centerY);
                    // Change scale
                    context.scale(options.zoom.value, options.zoom.value);
                    // Start rect draw
                    context.beginPath();
                    context.rect((item.x), (item.y), item.w, item.h);
                    context.fillStyle = item.color;
                    context.globalAlpha = 0.4;
                    context.fill();
                    context.lineWidth = 11;
                    context.strokeStyle = item.color;
                    context.stroke();
                    context.restore();
                }
            }


        };

        vm.zoom = (context, reader, options, overlays, picPos, direction, findings: IFinding[], rulers: IRuler[], maxPosition: IMaxPosition, rePosition: IRePosition, imageDimennsions: IPosition) => {
            var oldWidth;
            var newWidth = 0;
            var oldHeight;
            var newHeight = 0;
            var oldZoom = options.zoom.value;
            oldWidth = reader.width * oldZoom;
            oldHeight = reader.height * oldZoom;

            options.zoom.value += options.zoom.step * direction;

            if (options.zoom.value > options.zoom.max) {
                options.zoom.value = options.zoom.max;
            }
            if (options.zoom.value < options.zoom.min || options.zoom.value < options.zoom.min + 0.1) {
                options.zoom.value = options.zoom.min;
            }
            if (oldZoom === options.zoom.value) {
                return;
            }
           this.applyZoom = true;
            // Compute new image size
            newWidth = reader.width * options.zoom.value;
            newHeight = reader.height * options.zoom.value;
            let leftX: number;
            let leftY: number;
            let ratio = { x: 0, y: 0 };

            //do we need to recalculate the postition of image after zoom
            if (rePosition.x) {
                let diffX = (newWidth - oldWidth);


                //Below is the maths: to keep ratio of left and right max position same. Calculate move values from 2 equations below
                if (maxPosition.x === maxPosition.rightX) {
                    leftX = (diffX / 2);// * imageDimennsions.x /reader.width;//diffX - rightX;
                } else {
                    leftX = (diffX / 2);// * imageDimennsions.x / reader.width;//diffX - rightX;
                }
                picPos.x = picPos.x - leftX;
                maxPosition.x += leftX;
                if (maxPosition.x < 0) {
                    let diff = (0 - maxPosition.x);
                    maxPosition.x = 0;
                    picPos.x -= diff;
                    ratio.x = diff;
                }
                maxPosition.rightX += leftX;
                if (maxPosition.rightX < 0) {
                    let diff = 0 - maxPosition.rightX;
                    maxPosition.rightX = 0;
                    picPos.x += diff;
                    ratio.x = diff;

                }
            }

            if (rePosition.y) {
                let diffY = (newHeight - oldHeight);
                //Same for Y(height) as above
                if (maxPosition.y === maxPosition.rightY) {
                    leftY = (diffY / 2);// * imageDimennsions.y / reader.height; //diffY - rightY;
                }
                else {
                    leftY = (diffY / 2);// * imageDimennsions.y / reader.height; //diffY - rightY;
                }
                picPos.y = picPos.y - (leftY);
                maxPosition.y += (leftY);
                if (maxPosition.y < 0) {
                    let diff = 0 - maxPosition.y;
                    maxPosition.y = 0;
                    picPos.y -= diff;
                    ratio.y = diff;
                }

                maxPosition.rightY += (leftY);
                if (maxPosition.rightY < 0) {
                    let diff = 0 - maxPosition.rightY;
                    maxPosition.rightY = 0;
                    picPos.y += diff;
                    ratio.y = diff;

                }
            }
};

        vm.zoomRulers = (reader, imageDimennsions, options, oldZoom, rulers: IRuler[], picPos) => {
            if (rulers) {
                for (var i = 0; i <= rulers.length - 1; i++) {
                    let ruler = rulers[i];
                    ruler.displayCoordinates.startPoint.x = (ruler.coordinates.startPoint.x * options.zoom.value) + picPos.x;
                    ruler.displayCoordinates.startPoint.y = ((ruler.coordinates.startPoint.y) * options.zoom.value) + picPos.y;
                    ruler.displayCoordinates.endPoint.x = (ruler.coordinates.endPoint.x * options.zoom.value) + picPos.x;
                    ruler.displayCoordinates.endPoint.y = ((ruler.coordinates.endPoint.y) * options.zoom.value) + picPos.y;//+vm.tempGap;
                    ruler.rulerWidth = Number((ruler.length * options.zoom.value / imageConfig.scanResoution).toFixed(3));
                    //ruler.height = options.zoom.value * 19/ options.zoom.min;
                    ruler.height = (options.zoom.value * 37)/ options.zoom.min;//+this.tempGap;
                    ruler.actualWidth = ruler.rulerWidth;
                }
            }
        };
        vm.zoomMarks = (reader, imageDimennsions, options, oldZoom, findings, picPos) => {
            //let adj = 40;//will need to add the top bar height with case status buttons to get display height
            //let mapWidth = imageDimennsions.x / reader.width;
            //let mapHeight = imageDimennsions.y / reader.height;

            if (findings) {
                for (var i = 0; i <= findings.length - 1; i++) {
                    let tempMark = findings[i];
                    tempMark.displayBox.leftTopCoordinate.x = (tempMark.boundingBox.leftTopCoordinate.x * options.zoom.value) + picPos.x;
                    tempMark.displayBox.leftTopCoordinate.y = (tempMark.boundingBox.leftTopCoordinate.y  * options.zoom.value) + picPos.y;
                    tempMark.displayBox.rightBottomCoordinate.x = (tempMark.boundingBox.rightBottomCoordinate.x * options.zoom.value) + picPos.x;
                    tempMark.displayBox.rightBottomCoordinate.y = ((tempMark.boundingBox.rightBottomCoordinate.y ) * options.zoom.value) + picPos.y;
                    tempMark.displayWidth = tempMark.displayBox.rightBottomCoordinate.x - tempMark.displayBox.leftTopCoordinate.x;
                    tempMark.displayHeight = tempMark.displayBox.rightBottomCoordinate.y - tempMark.displayBox.leftTopCoordinate.y;
                }
            }
        };

        vm.rotate = (contxt, reader, options, overlays, picPos, direction) => {
            options.rotate.value += options.rotate.step * direction;
            if ((options.rotate.value <= -360) || (options.rotate.value >= 360)) {
                options.rotate.value = 0;
            }
            this.applyTransform(contxt, reader, options, overlays, picPos, false);
            //this.resizeTo('page');
        };

        vm.overLay = (contxt, reader, options, overlays, picPos) => {
            vm.applyTransform(contxt, reader, options, overlays, picPos, false);
        };

        vm.negative = (context, width, height, picPos) => {

            var imageData = context.getImageData(picPos.x, picPos.y, width, height);
            var pixels = imageData.data;
            for (var i = 0; i < pixels.length; i += 4) {
                pixels[i] = 255 - pixels[i];   // red
                pixels[i + 1] = 255 - pixels[i + 1]; // green
                pixels[i + 2] = 255 - pixels[i + 2]; // blue
                // i+3 is alpha (the fourth element)
            }

            // overwrite original image
            context.putImageData(imageData, picPos.x, picPos.y, picPos.x, picPos.y, width, height);
        };

        vm.sharpen = (context, w, h, mix, picPos) => {
            var weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
            var katet = Math.round(Math.sqrt(weights.length));
            var half = (katet * 0.5) | 0;
            var dstData = context.createImageData(w, h);
            var dstBuff = dstData.data;
            var srcBuff = context.getImageData(picPos.x, picPos.y, w, h).data;
            var y = h;

            while (y--) {
                var x = w;
                while (x--) {

                    var sy = y;
                    var sx = x;
                    var dstOff = (y * w + x) * 4;
                    var r = 0;
                    var g = 0;
                    var b = 0;

                    for (var cy = 0; cy < katet; cy++) {
                        for (var cx = 0; cx < katet; cx++) {

                            var scy = sy + cy - half;
                            var scx = sx + cx - half;

                            if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

                                var srcOff = (scy * w + scx) * 4;
                                var wt = weights[cy * katet + cx];

                                r += srcBuff[srcOff] * wt;
                                g += srcBuff[srcOff + 1] * wt;
                                b += srcBuff[srcOff + 2] * wt;
                            }
                        }
                    }

                    dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                    dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                    dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                    dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
                }
            }
            context.putImageData(dstData, picPos.x, picPos.y, picPos.x, picPos.y, w, h);
        };
    }

    private centerPics = (context, options, reader, picPos) => {
        // Position to canvas center
        var centerX = context.canvas.width / 2;
        var picPosX = 0;
        picPosX = centerX - (reader.width * options.zoom.value) / 2;
        picPos = { x: picPosX, y: 0 };
    }

}
