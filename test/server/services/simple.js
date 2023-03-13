
if (_auth.isJWT() && _jwt.check()) {
  _log.info('JWT TOKEN DATA', _jwt.data());
  _out.json({result: true});
} else {
  _header.status(403);
  _out.json({result: false});
}

