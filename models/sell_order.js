(function() {
  var MarketHelper, math;

  MarketHelper = require("../lib/market_helper");

  math = require("mathjs")({
    number: "bignumber",
    decimals: 8
  });

  module.exports = function(sequelize, DataTypes) {
    var SellOrder;
    SellOrder = sequelize.define("SellOrder", {
      external_order_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true
      },
      type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "market, limit",
        get: function() {
          return MarketHelper.getOrderTypeLiteral(this.getDataValue("type"));
        },
        set: function(type) {
          return this.setDataValue("type", MarketHelper.getOrderType(type));
        }
      },
      buy_currency: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        get: function() {
          return MarketHelper.getCurrencyLiteral(this.getDataValue("buy_currency"));
        },
        set: function(buyCurrency) {
          return this.setDataValue("buy_currency", MarketHelper.getCurrency(buyCurrency));
        }
      },
      sell_currency: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        get: function() {
          return MarketHelper.getCurrencyLiteral(this.getDataValue("sell_currency"));
        },
        set: function(sellCurrency) {
          return this.setDataValue("sell_currency", MarketHelper.getCurrency(sellCurrency));
        }
      },
      amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        validate: {
          isFloat: true,
          notNull: true
        }
      },
      matched_amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        validate: {
          isFloat: true
        }
      },
      result_amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        validate: {
          isFloat: true
        }
      },
      fee: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        validate: {
          isFloat: true
        }
      },
      unit_price: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
        validate: {
          isFloat: true
        }
      },
      status: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: MarketHelper.getOrderStatus("open"),
        comment: "open, partiallyCompleted, completed",
        get: function() {
          return MarketHelper.getOrderStatusLiteral(this.getDataValue("status"));
        },
        set: function(status) {
          return this.setDataValue("status", MarketHelper.getOrderStatus(status));
        }
      }
    }, {
      tableName: "sell_orders",
      getterMethods: {
        left_amount: function() {
          return math.add(this.amount, -this.matched_amount);
        },
        action: function() {
          return "sell";
        }
      },
      classMethods: {
        findById: function(id, callback) {
          return SellOrder.find(id).complete(callback);
        },
        findByOrderId: function(orderId, callback) {
          return SellOrder.find({
            where: {
              external_order_id: orderId
            }
          }).complete(callback);
        }
      }
    });
    return SellOrder;
  };

}).call(this);