module.exports = {
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id: { type: 'integer', primaryKey: true },
    user_id: { type: 'integer' },
    wedding_data: { type: 'string' },
  },
    options: {
    tableName: 'meeting',
      timestamps: false,
  }
};
