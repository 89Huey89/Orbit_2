// The colophon: a short run ended by the dark, and a longer one ended with more on the sheet, then the
// finished plate read back in review, before and after its title tablet is lettered.
export default {
  name:'end',
  description:'The colophon after a short and a longer run, and the review of the plate.',
  async run(g){
    await g.start();
    await g.fly(3);
    await g.die('THE DARK CAUGHT UP');
    await g.shot('colophon-short');
    await g.shot('colophon-short-full',{fullPage:true});
    await g.tap();
    await g.fly(25);
    await g.die('THE NIB RAN DRY');
    await g.shot('colophon-long');
    await g.openReview();
    await g.shot('review');
    // The title tablet inks on row by row as review opens; this is the sheet once it is lettered.
    await g.advance(2);await g.shot('review-titled');
  }
};
