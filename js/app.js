const canvas = document.querySelector('#canvas');


canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext('2d');

const scoreElement = document.querySelector('#score');
const startBtn = document.querySelector('#start-btn');
const container = document.querySelector('#container');
const finalScore = document.querySelector('#finalScore');
//Creating Player
class Player{
 constructor(x,y,radius,color){
     this.x = x;
     this.y = y;
     this.radius = radius;
     this.color = color;

 }
 draw(){
     c.beginPath()
     c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
     c.fillStyle = this.color
     c.fill();
    
 }
}

// Creating Projectiles
class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
   
    }
    
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        c.fillStyle = this.color
        c.fill();
       
    }
    // updating velocity
    update(){
        this.draw();
        this.x +=  this.velocity.x;
        this.y +=  this.velocity.y;
    }
}

// Creating enemy
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
   
    }
    
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        c.fillStyle = this.color
        c.fill();
       
    }
    // updating velocity
    update(){
        this.draw();
        this.x +=  this.velocity.x;
        this.y +=  this.velocity.y;
    }
}

// Particles for fire cracrers
const friction = 0.99;
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
   
    }
    
    draw(){
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        c.fillStyle = this.color
        c.fill();
        c.restore();
       
    }
    // updating velocity
    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x +=  this.velocity.x;
        this.y +=  this.velocity.y;
        this.alpha -= 0.01;
    }
}
// Initialising player
const x = canvas.width/2;
const y = canvas.height/2;
const playerRadius = 10;
const playerColor = "#ff9933";
let player = new Player(x,y,playerRadius,playerColor);


// Variables 
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let score = 0;
let setScore = { 
    smallScore:50,
    largeScore:150
}
  
function init(){
     player = new Player(x,y,playerRadius,playerColor);
     projectiles = [];
     enemies = [];
     particles = [];
     score = 0;
     scoreElement.innerHTML = score;
     finalScore.innerHTML = score;
}

// Showing Enemy on the screen
function createEnemy(){
     setInterval(() => {
         const radius = Math.random() * (30 - 4) + 4;
         let x;
         let y;
        //  generaing enemy from the outside of screen randomaly
         if(Math.random() < 0.5){
             x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
             y = Math.random() * canvas.height;
         }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius; 
         }
        
         const color =`hsl(${Math.random() * 360}, 50%, 50%)`;
         const angle = Math.atan2(canvas.height/2 - y,canvas.width/2 - x);
        const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
   }
       enemies.push(new Enemy(x,y,radius,color,velocity));
       
     },1000); 
     
 } 
// animating projectiles
 
function animate(){
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgba(0,0,0,.1)";
    c.fillRect(0,0,canvas .width,canvas.height);
    player.draw();
    particles.forEach((particle,particleIndex) =>{
        if(particle.alpha <= 0){
            particles.splice(particleIndex,1);
        }else{
            particle.update();
        }
       
    })
    // drawing and updating projectile
    projectiles.forEach((projectile,projectileIndex) => {
      projectile.update();
    //   removing projectile after they cross the edges of screen
      if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height){
        setTimeout(() => {
            
            projectiles.splice(projectileIndex,1); 
        }, 0);
      }
    }) 
    // drawing and updating enemies
    enemies.forEach((enemy,enemyIndex) =>{
        enemy.update();
//    colllision between enemy and player
     const dist = Math.hypot(player.x - enemy.x,player.y - enemy.y);
    //  End game
     if(dist - enemy.radius - player.radius < 1){
        cancelAnimationFrame(animationId);
        container.classList.remove('hide');
        finalScore.innerHTML = score;
     }
        // collision between enemy and projectile
        projectiles.forEach((projectile,projectileIndex) => {
            // getting distance between enemy and projectile
            const dist = Math.hypot(projectile.x - enemy.x,projectile.y - enemy.y);
        //   removing enemy and projectile after hit/collision
            if(dist - enemy.radius - projectile.radius < 1){
           

                // crating fire cracres particles or explosion
                for(let i =0; i< enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x,projectile.y,Math.random() * 2,enemy.color,{x: (Math.random() - 0.5) * (Math.random() * 7),y: (Math.random() - 0.5) * (Math.random() * 7)}))
                }
                if(enemy.radius - 10 > 5){
                   //  increasing score
                    score += setScore.smallScore;
                    scoreElement.innerHTML = score;
                    gsap.to(enemy,{
                        radius:enemy.radius - 10
                    });
                    setTimeout(() => {
                       projectiles.splice(projectileIndex,1); 
                    }, 0);
                }else{
                     //  increasing score when all together removes
                   score += setScore.largeScore;
                  scoreElement.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(enemyIndex,1);
                        projectiles.splice(projectileIndex,1); 
                    }, 0);
                }
         }
        })
    })
   
} 

// Initialing Projectile on click
addEventListener('click',(event)=>{
   
   const angle = Math.atan2(event.clientY - canvas.height/2,event.clientX - canvas.width/2);
   const velocity = {
       x: Math.cos(angle) * 6,
       y: Math.sin(angle) * 6
   }
    projectiles.push(new Projectile(canvas.width/2,canvas.height/2,5,"#ff9933",velocity));
   
})

// Starting the game
startBtn.addEventListener('click',()=>{
    init();
  container.classList.add('hide');
  animate()
  createEnemy();
});
