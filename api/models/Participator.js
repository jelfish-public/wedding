module.exports = {
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id: { type: 'integer', primaryKey: true },
    name: { type: 'string' },
    attend_or_not: { type: 'integer' },
    attend_num: { type: 'integer' },
    vegetarian_or_not: { type: 'integer' },
    others: { type: 'string' },
    qrcode: { type: 'string' },
  },
    options: {
    tableName: 'participator',
      timestamps: false,
  }
};
