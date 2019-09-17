///import { Injectable } from '@angular/core';
import { IImageOptions } from '../models/viewModels';
import { IImageReaderService } from '../interfaces/interfaces';

export class ImageReaderService implements IImageReaderService {
	createReader: (mimeType: any, obj: any) => any;
	IsSupported: (mimeType: any) => boolean;

	mimetype: string[];
	anno: any;
	reader: any;
	rendered: boolean;
	isZoom: boolean;
	width: number;
	height: number;
    img: any;
    imgData: any;

	images: any[];
	tiff: any;
	options: IImageOptions;
	currentPage: number;
	data: any;
	constructor() {
		var vm = this;
		vm.mimetype = [
			'image/png',
			'image/jpg',
			'image/jpeg'
		];

		// Is Tiff module present
		if (typeof (Tiff) !== 'undefined') {
			this.mimetype.push('image/tif');
			this.mimetype.push('image/tiff');
		}

		vm.IsSupported = (mimeType) => {
			return (this.mimetype.indexOf(mimeType) !== -1);
		};
		vm.createReader = (mimeType, obj) => {
			vm.reader = null;

			if (mimeType === '') {
				mimeType = this.GuessMimeType(obj);
			}

			switch (mimeType.toLowerCase()) {
				case 'image/tif':
				case 'image/tiff': vm.reader = { create: this.tiffReader }; break;
				case 'image/png':
				case 'image/jpg':
				case 'image/jpeg': vm.reader = { create: this.imageReader }; break;
			}
			return vm.reader;
		};
	}

	tiffReader = (data, options, callback, overImage) => {
		if (options.controls.toolbar) {
			options.controls.image = true;
			options.controls.sound = false;
		}
		var vm = this;

		vm.reader = new FileReader();
		vm.rendered = false;
		vm.tiff = null;
		vm.img = null;
		vm.data = null;
		vm.width = -1;
		vm.height = -1;
		vm.options = options;
		vm.images = [];
		vm.currentPage = -1;
		vm.isZoom = true;

		if (options.controls.enableOverlay) {
			vm.images.push(overImage);
		}


		let refresh = function () {

			if (vm.reader.result == undefined) {
				return;
			}

			if (vm.tiff == null) {
				vm.tiff = new Tiff({ buffer: vm.reader.result });
				options.controls.totalPage = vm.tiff.countDirectory();
				options.controls.numPage = 1;
				options.info = {
					width: vm.tiff.width(),
					height: vm.tiff.height(),
					compression: vm.tiff.getField(Tiff.Tag.COMPRESSION),
					document: vm.tiff.getField(Tiff.Tag.DOCUMENTNAME),
					description: vm.tiff.getField(Tiff.Tag.IMAGEDESCRIPTION),
					orientation: vm.tiff.getField(Tiff.Tag.ORIENTATION),
					xresolution: vm.tiff.getField(Tiff.Tag.XRESOLUTION),
					yresolution: vm.tiff.getField(Tiff.Tag.YRESOLUTION)
				};
			}

			// Limit page number if upper
			if (options.controls.numPage > options.controls.totalPage) {
				options.controls.numPage = options.controls.totalPage;
			}
			// Set to correct page
			if (options.controls.filmStrip) {
				vm.images = [];
				for (var p = 0; p < vm.tiff.countDirectory(); p++) {
					vm.tiff.setDirectory(p);
					// Set only first page @TODO
					if (p === 0) {
						vm.width = vm.tiff.width();
						vm.height = vm.tiff.height();
					}
					vm.images[p] = new Image();
					vm.images[p].onload = function () {
						if (vm.images.length === 1) {
							vm.img = vm.images[0];
						}
						callback();
						vm.rendered = true;
					};
					vm.images[p].src = vm.tiff.toDataURL();
					vm.images[p].pageNum = p;
					//that.currentPage = that.options.controls.numPage;
				}

			} else {
				if (vm.currentPage !== options.controls.numPage) {
					vm.tiff.setDirectory(options.controls.numPage - 1);
					vm.width = vm.tiff.width();
					vm.height = vm.tiff.height();
					vm.img = new Image();
                    vm.img.onload = function () {
                        vm.imgData = options.ctx.getImageData(0, 0, vm.width, vm.height);
						callback();
						vm.rendered = true;
					};
					vm.img.src = vm.tiff.toDataURL();
					options.ctx.drawImage(vm.img, 0, 0);
					//options.ctx.drawImage(img, 111, 111);

					vm.currentPage = options.controls.numPage;
				}
			}
		};

		this.reader.onload = function () {
			if (vm.tiff != null) {
				vm.tiff.close();
				vm.tiff = null;
			}
			Tiff.initialize({ TOTAL_MEMORY: 67108864 });//100000000
			refresh();
		};

		if (typeof (data) === 'string') {
			vm.img = new Image();
			if (data.toLowerCase().indexOf('tiff') >= 0) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', data);
				xhr.responseType = 'arraybuffer';

				xhr.onreadystatechange = function () {
					if (xhr.readyState === XMLHttpRequest.DONE) {
						var tiff = new Tiff({ buffer: xhr.response });
						tiff = tiff;
						vm.width = tiff.width();
						vm.height = tiff.height();
						vm.img = new Image();
						vm.img.onload = function () {
                            vm.rendered = true;
                            vm.imgData = options.ctx.getImageData(0, 0, vm.width, vm.height);

							callback();

						};
						vm.img.src = tiff.toDataURL();
						//anno.makeAnnotatable(img);

						//var base64 = base64ArrayBuffer(xhr.response);
						//that.img.src = base64;
						if (options.controls.enableOverlay) {
							let img2 = new Image();
							img2.src = overImage;

							options.ctx.drawImage(img2, 0, 100, 111, 111, 110, 1111, 111, 111);
						}
						else {
							options.ctx.drawImage(vm.img, 0, 0);
						}


					}
				};
				xhr.send();
			}
			else {
				vm.img.src = data;
			}

		}
		else if (typeof (data) === 'object') {
			vm.img = new Image();
			var arrayBuffer;
			vm.reader.readAsArrayBuffer(data);
			vm.reader.onload = function () {
				arrayBuffer = this.result;
				var tiff = new Tiff({ buffer: arrayBuffer });
				tiff = tiff;
				vm.width = tiff.width();
				vm.height = tiff.height();
				vm.img = new Image();
                vm.img.onload = function () {
                    vm.imgData = options.ctx.getImageData(0, 0, vm.width, vm.height);

					vm.rendered = true;
					callback();
				};
				vm.img.src = tiff.toDataURL();
				if (options.ctx) {
					options.ctx.drawImage(vm.img, 0, 0);
				}
			};
		}
		else {
			this.reader.readAsArrayBuffer(data);
		}

		return this;
	}

	imageReader = (data, options, callback, overImage) => {
		if (options.controls.toolbar) {
			options.controls.image = true;
			options.controls.sound = false;
		}
		this.reader = new FileReader();
		var vm = this;

		vm.img = new Image();
		vm.img.onload = function () {
			vm.width = vm.img.width;
            vm.height = vm.img.height;
            vm.imgData = options.ctx.getImageData(0, 0, vm.width, vm.height);

			callback();
			vm.rendered = true;
		};
		vm.data = null;
		vm.width = -1;
		vm.height = -1;
		options.info = {};
		vm.isZoom = true;
		vm.rendered = false;
		this.reader.onload = function () {
			vm.img.src = vm.reader.result;
			//options.ctx.drawImage(vm.img, 0, 0);
			setTimeout(() => { options.ctx.drawImage(vm.img, 0, 0); }, 200);
		};
		if (typeof (data) === 'string') {
			vm.img.src = data;
		} else {
			this.reader.readAsDataURL(data);
		}
		// PNG or JPEG are one page only
		options.controls.totalPage = 1;
		options.controls.numPage = 1;
		return this;
	}
	GuessMimeType = (fileName) => {
		// try to guess mime type if not available
		var mimeType = '';
		mimeType = 'image/' + fileName.substring(fileName.indexOf('.') + 1);
		return mimeType.toLowerCase();
	}

}
