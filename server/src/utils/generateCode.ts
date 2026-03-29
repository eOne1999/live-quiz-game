export const generateCode = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randInd = Math.floor(Math.random() * alphabet.length);
    code += alphabet[randInd];
  }
  return code;
};
