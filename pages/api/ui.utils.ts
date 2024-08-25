
export  const formatSignatureCid = (cid: string) => {
    if (!cid) return 'N/A';
    return `${cid.slice(0, 6)}....${cid.slice(-4)}`;
  };