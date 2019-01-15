/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Util } from '../../../util/util';
import { element, by, protractor } from 'protractor';

export class UploadDialog {

    closeButton = element((by.css('footer[class*="upload-dialog__actions"] button[id="adf-upload-dialog-close"]')));
    dialog = element(by.css('div[id="upload-dialog"]'));
    minimizedDialog = element(by.css('div[class*="upload-dialog--minimized"]'));
    uploadedStatusIcon = by.css('mat-icon[class*="status--done"]');
    cancelledStatusIcon = by.css('div[class*="status--cancelled"]');
    errorStatusIcon = by.css('div[class*="status--error"]');
    rowByRowName = by.xpath('ancestor::adf-file-uploading-list-row');
    title = element(by.css('span[class*="upload-dialog__title"]'));
    minimizeButton = element(by.css('mat-icon[title="Minimize"]'));
    maximizeButton = element(by.css('mat-icon[title="Maximize"]'));

    clickOnCloseButton() {
        this.checkCloseButtonIsDisplayed();
        this.closeButton.click();
        return this;
    }

    checkCloseButtonIsDisplayed() {
        Util.waitUntilElementIsVisible(this.closeButton);
        return this;
    }

    dialogIsDisplayed() {
        Util.waitUntilElementIsVisible(this.dialog);
        return this;
    }

    dialogIsMinimized() {
        Util.waitUntilElementIsVisible(this.minimizedDialog);
        return this;
    }

    dialogIsNotDisplayed() {
        Util.waitUntilElementIsNotOnPage(this.dialog);
        return this;
    }

    getRowsName(content) {
        let row = element.all(by.css(`div[class*='uploading-row'] span[title="${content}"]`)).first();
        Util.waitUntilElementIsVisible(row);
        return row;
    }

    getRowByRowName(content) {
        return this.getRowsName(content).element(this.rowByRowName);
    }

    fileIsUploaded(content) {
        Util.waitUntilElementIsVisible(this.getRowByRowName(content).element(this.uploadedStatusIcon));
        return this;
    }

    fileIsError(content) {
        Util.waitUntilElementIsVisible(this.getRowByRowName(content).element(this.errorStatusIcon));
        return this;
    }

    filesAreUploaded(content) {
        for (let i = 0; i < content.length; i++) {
            this.fileIsUploaded(content[i]);
        }
        return this;
    }

    fileIsNotDisplayedInDialog(content) {
        Util.waitUntilElementIsNotVisible(element(by.css(`div[class*='uploading-row'] span[title="${content}"]`)));
        return this;
    }

    fileIsCancelled(content) {
        Util.waitUntilElementIsVisible(this.getRowByRowName(content).element(this.cancelledStatusIcon));
        return this;
    }

    removeUploadedFile(content) {
        Util.waitUntilElementIsVisible(this.getRowByRowName(content).element(this.uploadedStatusIcon));
        this.getRowByRowName(content).element(this.uploadedStatusIcon).click();
        return this;
    }

    getTitleText() {
        Util.waitUntilElementIsVisible(this.title);
        let deferred = protractor.promise.defer();
        this.title.getText().then((text) => {
            deferred.fulfill(text);
        });
        return deferred.promise;
    }

    numberOfCurrentFilesUploaded() {
        let deferred = protractor.promise.defer();
        this.getTitleText().then((text) => {
            deferred.fulfill(text.split('Uploaded ')[1].split(' / ')[0]);
        });
        return deferred.promise;
    }

    numberOfInitialFilesUploaded() {
        let deferred = protractor.promise.defer();
        this.getTitleText().then((text) => {
            deferred.fulfill(text.split('Uploaded ')[1].split(' / ')[1]);
        });
        return deferred.promise;
    }

    minimizeUploadDialog() {
        Util.waitUntilElementIsVisible(this.minimizeButton);
        this.minimizeButton.click();
        return this;
    }

    maximizeUploadDialog() {
        Util.waitUntilElementIsVisible(this.maximizeButton);
        this.maximizeButton.click();
        return this;
    }

}
