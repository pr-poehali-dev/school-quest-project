import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

interface User {
  name: string;
  level: number;
  points: number;
  achievements: string[];
  completedQuests: number[];
}

interface Question {
  id: number;
  question: string;
  type: 'choice' | 'input';
  options?: string[];
  correctAnswer: string;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  questions: Question[];
}

const quests: Quest[] = [
  {
    id: 1,
    title: 'Приключение математика',
    description: 'Реши математические задачки и помоги зайчику собрать морковки!',
    icon: '🐰',
    difficulty: 'easy',
    points: 100,
    questions: [
      { id: 1, question: 'Сколько будет 5 + 3?', type: 'choice', options: ['6', '7', '8', '9'], correctAnswer: '8' },
      { id: 2, question: 'Сколько будет 10 - 4?', type: 'choice', options: ['4', '5', '6', '7'], correctAnswer: '6' },
      { id: 3, question: 'Напиши ответ: 2 × 3 = ?', type: 'input', correctAnswer: '6' }
    ]
  },
  {
    id: 2,
    title: 'Мир животных',
    description: 'Узнай больше о животных вместе с енотом-исследователем!',
    icon: '🦝',
    difficulty: 'easy',
    points: 100,
    questions: [
      { id: 1, question: 'Какое животное самое большое на планете?', type: 'choice', options: ['Слон', 'Синий кит', 'Жираф', 'Медведь'], correctAnswer: 'Синий кит' },
      { id: 2, question: 'Сколько ног у паука?', type: 'choice', options: ['6', '8', '10', '4'], correctAnswer: '8' },
      { id: 3, question: 'Напиши, кто говорит "Мяу"?', type: 'input', correctAnswer: 'кот' }
    ]
  },
  {
    id: 3,
    title: 'Космическое путешествие',
    description: 'Отправься в космос с лисичкой-астронавтом!',
    icon: '🦊',
    difficulty: 'medium',
    points: 150,
    questions: [
      { id: 1, question: 'Какая планета самая близкая к Солнцу?', type: 'choice', options: ['Земля', 'Марс', 'Меркурий', 'Венера'], correctAnswer: 'Меркурий' },
      { id: 2, question: 'Сколько планет в Солнечной системе?', type: 'choice', options: ['7', '8', '9', '10'], correctAnswer: '8' },
      { id: 3, question: 'Напиши название нашей планеты:', type: 'input', correctAnswer: 'земля' }
    ]
  }
];

const achievements = [
  { id: 'first_quest', name: 'Первый шаг', icon: '🌟', description: 'Завершил первый квест' },
  { id: 'three_quests', name: 'Исследователь', icon: '🔍', description: 'Завершил 3 квеста' },
  { id: 'perfect_score', name: 'Отличник', icon: '💯', description: 'Получил 100% в квесте' }
];

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [inputAnswer, setInputAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const handleLogin = (name: string) => {
    if (!name.trim()) {
      toast({ title: 'Введи своё имя!', variant: 'destructive' });
      return;
    }
    setUser({
      name: name.trim(),
      level: 1,
      points: 0,
      achievements: [],
      completedQuests: []
    });
    setIsLoggedIn(true);
    toast({ title: `Привет, ${name}! 👋`, description: 'Добро пожаловать в мир квестов!' });
  };

  const handleRegister = (name: string) => {
    handleLogin(name);
  };

  const startQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setInputAnswer('');
    setSelectedAnswer('');
  };

  const submitAnswer = () => {
    if (!selectedQuest) return;
    
    const answer = selectedQuest.questions[currentQuestion].type === 'input' ? inputAnswer : selectedAnswer;
    
    if (!answer.trim()) {
      toast({ title: 'Выбери ответ!', variant: 'destructive' });
      return;
    }

    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);
    setInputAnswer('');
    setSelectedAnswer('');

    if (currentQuestion + 1 < selectedQuest.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      showQuestResults(newAnswers);
    }
  };

  const showQuestResults = (answers: string[]) => {
    if (!selectedQuest || !user) return;

    let correctCount = 0;
    selectedQuest.questions.forEach((q, idx) => {
      if (answers[idx].toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        correctCount++;
      }
    });

    const percentage = (correctCount / selectedQuest.questions.length) * 100;
    const earnedPoints = Math.round((percentage / 100) * selectedQuest.points);

    const newUser = { ...user };
    newUser.points += earnedPoints;
    
    if (!newUser.completedQuests.includes(selectedQuest.id)) {
      newUser.completedQuests.push(selectedQuest.id);
      
      if (newUser.completedQuests.length === 1 && !newUser.achievements.includes('first_quest')) {
        newUser.achievements.push('first_quest');
        toast({ title: '🎉 Новое достижение!', description: 'Первый шаг - Завершил первый квест!' });
      }
      if (newUser.completedQuests.length >= 3 && !newUser.achievements.includes('three_quests')) {
        newUser.achievements.push('three_quests');
        toast({ title: '🎉 Новое достижение!', description: 'Исследователь - Завершил 3 квеста!' });
      }
    }

    if (percentage === 100 && !newUser.achievements.includes('perfect_score')) {
      newUser.achievements.push('perfect_score');
      toast({ title: '🎉 Новое достижение!', description: 'Отличник - Получил 100% в квесте!' });
    }

    setUser(newUser);
    setShowResults(true);
  };

  const calculateGrade = () => {
    if (!selectedQuest) return '';
    let correctCount = 0;
    selectedQuest.questions.forEach((q, idx) => {
      if (userAnswers[idx]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        correctCount++;
      }
    });
    const percentage = (correctCount / selectedQuest.questions.length) * 100;
    if (percentage >= 90) return '5 (Отлично!)';
    if (percentage >= 75) return '4 (Хорошо!)';
    if (percentage >= 60) return '3 (Удовлетворительно)';
    return '2 (Попробуй ещё раз!)';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl animate-bounce-in">
          <CardHeader className="text-center space-y-2">
            <div className="text-6xl mb-4 animate-bounce-in">🚀</div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              КвестЛэнд
            </CardTitle>
            <CardDescription className="text-lg">Образовательная платформа для юных исследователей!</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={showLogin ? 'login' : 'register'} onValueChange={(v) => setShowLogin(v === 'login')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-name">Твоё имя</Label>
                  <Input 
                    id="login-name" 
                    placeholder="Введи своё имя"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>
                <Button 
                  className="w-full text-lg font-semibold" 
                  size="lg"
                  onClick={(e) => {
                    const input = document.getElementById('login-name') as HTMLInputElement;
                    handleLogin(input.value);
                  }}
                >
                  Войти <Icon name="ArrowRight" className="ml-2" />
                </Button>
              </TabsContent>
              <TabsContent value="register" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Твоё имя</Label>
                  <Input 
                    id="register-name" 
                    placeholder="Введи своё имя"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRegister((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>
                <Button 
                  className="w-full text-lg font-semibold" 
                  size="lg"
                  onClick={() => {
                    const input = document.getElementById('register-name') as HTMLInputElement;
                    handleRegister(input.value);
                  }}
                >
                  Зарегистрироваться <Icon name="Sparkles" className="ml-2" />
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🚀</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              КвестЛэнд
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Icon name="Star" className="mr-2" size={18} />
              {user?.points} баллов
            </Badge>
            <Button variant="outline" size="sm" className="font-semibold">
              <Icon name="User" className="mr-2" size={18} />
              {user?.name}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="quests" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-14">
            <TabsTrigger value="quests" className="text-base">
              <Icon name="MapPin" className="mr-2" size={20} />
              Квесты
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-base">
              <Icon name="Trophy" className="mr-2" size={20} />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-base">
              <Icon name="User" className="mr-2" size={20} />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="help" className="text-base">
              <Icon name="HelpCircle" className="mr-2" size={20} />
              Помощь
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quests" className="space-y-6">
            <div className="text-center space-y-2 animate-slide-up">
              <h2 className="text-4xl font-bold">Выбери своё приключение! 🎯</h2>
              <p className="text-lg text-muted-foreground">Проходи квесты, зарабатывай баллы и получай достижения</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.map((quest, idx) => (
                <Card 
                  key={quest.id} 
                  className="hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer animate-slide-up border-2"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={() => startQuest(quest)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-6xl">{quest.icon}</span>
                      <Badge 
                        variant={quest.difficulty === 'easy' ? 'secondary' : quest.difficulty === 'medium' ? 'default' : 'destructive'}
                        className="text-sm"
                      >
                        {quest.difficulty === 'easy' ? 'Легко' : quest.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{quest.title}</CardTitle>
                    <CardDescription className="text-base">{quest.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Icon name="Star" size={16} className="text-primary" />
                        +{quest.points} баллов
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="HelpCircle" size={16} className="text-accent" />
                        {quest.questions.length} вопросов
                      </span>
                    </div>
                    {user?.completedQuests.includes(quest.id) && (
                      <Badge className="w-full justify-center" variant="outline">
                        <Icon name="Check" className="mr-1" size={16} />
                        Пройдено!
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold">Твои достижения! 🏆</h2>
              <p className="text-lg text-muted-foreground">Собирай значки за успехи в обучении</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {achievements.map((achievement) => {
                const earned = user?.achievements.includes(achievement.id);
                return (
                  <Card 
                    key={achievement.id} 
                    className={`transition-all ${earned ? 'border-primary border-2 shadow-lg' : 'opacity-60 grayscale'}`}
                  >
                    <CardHeader className="text-center">
                      <div className="text-6xl mb-2">{achievement.icon}</div>
                      <CardTitle className="text-xl">{achievement.name}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="text-7xl mb-4">👤</div>
                <CardTitle className="text-3xl">{user?.name}</CardTitle>
                <CardDescription className="text-lg">Уровень {user?.level}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс до следующего уровня</span>
                    <span className="font-bold">{user?.points || 0} / 500</span>
                  </div>
                  <Progress value={((user?.points || 0) / 500) * 100} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-primary">{user?.points}</div>
                    <div className="text-sm text-muted-foreground">Баллов</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-secondary">{user?.completedQuests.length}</div>
                    <div className="text-sm text-muted-foreground">Квестов</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-accent">{user?.achievements.length}</div>
                    <div className="text-sm text-muted-foreground">Достижений</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Как играть? 🎮</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-lg">
                  <div className="text-3xl">1️⃣</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Выбери квест</h3>
                    <p className="text-muted-foreground">Нажми на карточку квеста, который тебе интересен</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-secondary/10 rounded-lg">
                  <div className="text-3xl">2️⃣</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Отвечай на вопросы</h3>
                    <p className="text-muted-foreground">Выбирай правильные ответы или вводи свои</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-accent/10 rounded-lg">
                  <div className="text-3xl">3️⃣</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Получай награды</h3>
                    <p className="text-muted-foreground">За правильные ответы получай баллы и достижения!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedQuest && !showResults} onOpenChange={() => { setSelectedQuest(null); setShowResults(false); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <span className="text-4xl">{selectedQuest?.icon}</span>
              {selectedQuest?.title}
            </DialogTitle>
            <DialogDescription>
              Вопрос {currentQuestion + 1} из {selectedQuest?.questions.length}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Progress value={((currentQuestion + 1) / (selectedQuest?.questions.length || 1)) * 100} className="h-2" />
            {selectedQuest && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{selectedQuest.questions[currentQuestion].question}</h3>
                {selectedQuest.questions[currentQuestion].type === 'choice' ? (
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    <div className="space-y-3">
                      {selectedQuest.questions[currentQuestion].options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer">
                          <RadioGroupItem value={option} id={`option-${idx}`} />
                          <Label htmlFor={`option-${idx}`} className="text-lg cursor-pointer flex-1">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="answer-input" className="text-base">Твой ответ:</Label>
                    <Input 
                      id="answer-input"
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      placeholder="Введи ответ здесь..."
                      className="text-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitAnswer();
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            <Button onClick={submitAnswer} size="lg" className="w-full text-lg font-semibold">
              {currentQuestion + 1 === selectedQuest?.questions.length ? 'Завершить квест' : 'Следующий вопрос'}
              <Icon name="ArrowRight" className="ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResults} onOpenChange={() => { setShowResults(false); setSelectedQuest(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center">Результаты квеста! 🎉</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="text-8xl">
                {calculateGrade().startsWith('5') ? '🌟' : calculateGrade().startsWith('4') ? '😊' : calculateGrade().startsWith('3') ? '👍' : '💪'}
              </div>
              <div>
                <div className="text-5xl font-bold text-primary mb-2">{calculateGrade()}</div>
                <div className="text-xl text-muted-foreground">
                  Правильных ответов: {selectedQuest?.questions.filter((q, idx) => 
                    userAnswers[idx]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
                  ).length} из {selectedQuest?.questions.length}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {selectedQuest?.questions.map((q, idx) => {
                const isCorrect = userAnswers[idx]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                return (
                  <div key={q.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{q.question}</p>
                        <p className="text-sm">Твой ответ: <span className="font-medium">{userAnswers[idx]}</span></p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700">Правильный ответ: <span className="font-medium">{q.correctAnswer}</span></p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button onClick={() => { setShowResults(false); setSelectedQuest(null); }} size="lg" className="w-full text-lg font-semibold">
              Вернуться к квестам
              <Icon name="Home" className="ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
