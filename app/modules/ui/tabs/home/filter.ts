import { isUserLoggedIn } from 'common/helpers/customer';

type BlockInstrument = {
  method: string;
  providers?: string[];
};

type Block = {
  code: string;
  title: string;
  instruments: BlockInstrument[];
};

/**
 * Filter to either show or hide a block
 * Ex: hide the p13n block when user is logged out
 * @param block
 * @returns {Boolean} true | false
 */
export const methodsBlockFilter = (block: Block) => {
  // Preferred Methods Block
  if (!isUserLoggedIn() && block.code === 'rzp.preferred') return false;

  return true;
};
