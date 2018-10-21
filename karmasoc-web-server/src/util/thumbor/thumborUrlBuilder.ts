import { FiltersState } from './filter.model';
const ThumborUrlBuilder = require('thumbor-url-builder');
var config = require('config');

export class ThumboUrl {

    static smallAvatarImage(key) {
        const thumborURL = new ThumborUrlBuilder(config.get("thumbor.key"), 'thumborserver');
        return thumborURL.setImagePath(key).resize(73, 73).smartCrop(true).buildUrl();
    }

    static largeAvatarImage(key) {
        const thumborURL = new ThumborUrlBuilder(config.get("thumbor.key"), 'thumborserver');
        return thumborURL.setImagePath(key).resize(110, 110).smartCrop(true).buildUrl();
    }

    static smallPhoto(key) {
        const thumborURL = new ThumborUrlBuilder(config.get("thumbor.key"), 'thumborserver');
        return thumborURL.setImagePath(key).resize(330, 0).smartCrop(true).buildUrl();
    }

    static normalPhoto(key) {
        const thumborURL = new ThumborUrlBuilder(config.get("thumbor.key"), 'thumborserver');
        return thumborURL.setImagePath(key).resize(530, 0).smartCrop(true).buildUrl();
    }

    static largePhoto(key) {
        const thumborURL = new ThumborUrlBuilder(config.get("thumbor.key"), 'thumborserver');
        return thumborURL.setImagePath(key).resize(480, 270).smartCrop(true).buildUrl();
    }

     static verylargePhoto(key) {
        const thumborURL = new ThumborUrlBuilder(config.get("thumbor.key"), 'thumborserver');
        return thumborURL.setImagePath(key).resize(1080, 608).smartCrop(true).buildUrl();
    }


    static filterImages(key, filters: FiltersState) {
        const thumborURL = new ThumborUrlBuilder(config.get("thumbor.key"), 'thumborserver').setImagePath(key);
        if(filters.blur >0)
             thumborURL.filter(`blur(${filters.blur})`);
        if(filters.brightness >0)
            thumborURL.filter(`brightness(${filters.brightness})`);
        if(filters.contrast >0)
            thumborURL.filter(`contrast(${filters.contrast})`);
        if(filters.grayScale >0)
            thumborURL.filter(`contrast(${filters.grayScale})`);
        if(filters.background)
            thumborURL.filter(`background_color(${filters.background})`);
        return thumborURL;
    }

    static filteredSmallPhoto(thumbor) {
        return thumbor.resize(73, 73).smartCrop(true).buildUrl();
    }

    static filteredNormalPhoto(thumbor) {
        return thumbor.resize(480, 270).smartCrop(true).buildUrl();
    }

    static filteredLargePhoto(thumbor) {
        return thumbor.resize(480, 270).smartCrop(true).buildUrl();
    }

     static filteredVeryLargePhoto(thumbor) {
        return thumbor.resize(1080, 608).smartCrop(true).buildUrl();
    }
}