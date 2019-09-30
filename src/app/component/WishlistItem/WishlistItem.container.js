/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CartDispatcher } from 'Store/Cart';
import { WishlistDispatcher } from 'Store/Wishlist';
import { showNotification } from 'Store/Notification';
import WishlistItem from './WishlistItem.component';

export const mapDispatchToProps = dispatch => ({
    showNotification: (type, message) => dispatch(showNotification(type, __(message))),
    addProductToCart: options => CartDispatcher.addProductToCart(dispatch, options),
    updateWishlistItem: options => WishlistDispatcher.updateWishlistItem(dispatch, options),
    removeFromWishlist: options => WishlistDispatcher.removeItemFromWishlist(dispatch, options)
});

export class WishlistItemContainer extends PureComponent {
    static propTypes = {
        addProductToCart: PropTypes.func.isRequired,
        showNotification: PropTypes.func.isRequired,
        updateWishlistItem: PropTypes.func.isRequired,
        removeFromWishlist: PropTypes.func.isRequired
    };

    containerFunctions = () => ({
        addToCart: this.addItemToCart,
        getParameters: this.getParameters,
        changeQuantity: this.changeQuantity,
        removeItem: this.removeItemWithMessage,
        changeDescription: this.changeDescription

    });

    getConfigurableVariantIndex = (sku, variants) => Object.keys(variants).find(i => variants[i].sku === sku);

    getParameters = (sku, item) => {
        const { variants, configurable_options } = item;

        const options = Object.keys(configurable_options) || [];
        const configurableVariantIndex = this.getConfigurableVariantIndex(sku, variants);

        const { attributes = {} } = variants[configurableVariantIndex];
        const parameters = Object.entries(attributes).reduce((acc, [code, { attribute_value }]) => {
            if (!options.includes(code)) return acc;

            return {
                ...acc,
                [code]: [attribute_value]
            };
        }, {});

        return parameters;
    };

    addItemToCart = (item) => {
        const { addProductToCart } = this.props;

        const {
            type_id,
            variants,
            wishlist: {
                id, sku, quantity
            }
        } = item;

        const configurableVariantIndex = this.getConfigurableVariantIndex(sku, variants);
        const product = type_id === 'configurable'
            ? {
                ...item,
                configurableVariantIndex
            }
            : item;

        return addProductToCart({ product, quantity })
            .then(
                () => this.removeItem(id),
                () => showNotification('error', 'Error Adding Product To Cart')
            )
            .then(() => showNotification('success', 'Product Added To Cart'))
            .catch(() => showNotification('error', 'Error cleaning wishlist'));
    };

    changeQuantity = (item_id, quantity) => {
        const { updateWishlistItem } = this.props;
        updateWishlistItem({ item_id, quantity });
    };

    changeDescription = (item_id, description) => {
        const { updateWishlistItem } = this.props;
        updateWishlistItem({ item_id, description });
    };

    removeItem = (item_id, noMessages = true) => {
        const { removeFromWishlist } = this.props;
        return removeFromWishlist({ item_id, noMessages });
    };

    removeItemWithMessage = item_id => this.removeItem(item_id, false);

    render() {
        return <WishlistItem { ...this.props } { ...this.containerFunctions() } />;
    }
}

export default connect(null, mapDispatchToProps)(WishlistItemContainer);
