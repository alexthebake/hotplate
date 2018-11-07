import _ from 'lodash';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

global._ = _;
global.chai = chai;
global.assert = chai.assert;
global.expect = chai.expect;
global.sinon = sinon;
