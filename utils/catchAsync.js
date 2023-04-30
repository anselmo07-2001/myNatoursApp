//Creating higher order function, this function hold all the catch block
// in every controller
module.exports = fn => {
    // nagrereturn dito ng isang anonymous fn, kasi pag hindi ginawa ito
    // maiinvoke nayung fn, magiinvoke lng sa mga handler si express
    // another thing kaya nagreturn ng isang anonymous fn, is yung fn(req,res,next) is
    // wala silang value, pag nag trigger yung controller, magrereturn itong higher order fn nato
    // ng isang function na may req,res,next then yung value nila ipapass dun sa fn(req,res,next)
    return (req,res,next) => {
      fn(req,res,next).catch(err => next(err))
    }
}