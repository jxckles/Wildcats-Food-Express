// POST /todos
router.post("/", (req, res) => {
    res.status(201).json({ msg: "POST REQUEST TO /api/todos" });
  });
  

  router.post("/Login:", (req, res) => {
    res.status(200).json({ msg: "POST REQUEST TO /api/login/:id" });
  });

  router.post("/signup", (req, res) => {
    res.status(200).json({ msg: "POST REQUEST TO /api/signup/:id" });
  });
  
  router.post("/dashboard", (req, res) => {
    res.status(200).json({ msg: "POST REQUEST TO /api/dashboard/:id" });
  });

  router.post("/client-interface", (req, res) => {
    res.status(200).json({ msg: "POST REQUEST TO /api/client-interface/:id" });
  });
  

  router.post("/logout", (req, res) => {
    res.status(200).json({ msg: "POST REQUEST TO /api/logout/:id" });
  });
  
  router.post("/forgot-password", (req, res) => {
    res.status(200).json({ msg: "POST REQUEST TO /api/forgot-password/:id" });
  });
  
  
  
  module.exports = router;